import {ElementRef, Injectable} from '@angular/core';
import {Message, Room, RoomMember, User} from "./chat-data.types";
import * as Peer from 'simple-peer';
import {
  TypedMessage,
  UserListRequest,
  SdpExchangeRequest,
  SdpExchangeResponse,
  NewUserMessage
}
  from "../../../../common/src/types";
import {SocketService} from "./socket.service";
import {ChatEvents} from "../main/chat.events";

@Injectable()
export class ChatDataService {

  userName: string;
  users: User[] = [];
  rooms: Room[] = [];
  activeChatRoom: Room;

  streamVideo: any;
  receiveVideo: any;
  localStream: any;

  constructor(private socketService: SocketService) { }

  getUser(remoteUser: string){
    for (const user of this.users){
      if (user.name === remoteUser){
        return user;
      }
    }
    return null;
  }

  getChatRoom(userName: string){
    return this.rooms.find(
      (room) => room.members.some(
        (member) => member.user.name === userName
      )
    );
  }

  createRoom(
    remoteUser: User,
    isInitiator: boolean,
    onReady: Function,
    onMessage: Function,
    sdpMsg: SdpExchangeResponse = null
  ){
    const gotMedia = (stream) => {
      this.localStream = stream;
      const peer = new Peer({
        initiator: isInitiator,
        trickle: true,
        config: {
          iceServers: [
            {urls: ['stun:tudor.sch.bme.hu:8080'/*, 'turn:tudor.sch.bme.hu'*/]}
          ]
        },
        stream: stream
      });
      const remoteRoomMember = new RoomMember(remoteUser, peer);
      const room = new Room([remoteRoomMember]);
      this.rooms.push(room);

      if (this.streamVideo !== undefined && this.streamVideo.srcObject === undefined){
        this.streamVideo.srcObject = stream;
        this.streamVideo.play();
      }

      const onSignal = (sdpHeader) =>{
        console.log('SDP arrived from server.');
        if (!peer.connected) {
          const sdpExchangeMsg = JSON.stringify(
            new SdpExchangeRequest(remoteUser.name, sdpHeader)
          );
          console.log(`CLIENT -> SERVER: ${sdpExchangeMsg.substr(0, 80)}`);
          this.socketService.send(sdpExchangeMsg);
        }
      };
      peer.on('signal', onSignal);
      peer.on('error', (err) =>{
        console.log(`[ERROR]: ${err}`);
      });
      peer.on('data', (data) => {
        room.messages.push(new Message(remoteUser, data, null, room === this.activeChatRoom));
        console.log('data: ' + data);
        onMessage(remoteRoomMember, room);
      });
      peer.on('stream', (stream) => {
        console.log('Stream arrived!');
        if (this.receiveVideo){
          this.receiveVideo.srcObject = stream;
          this.receiveVideo.play();
        } else {
          remoteRoomMember.stream = stream;
        }
      });
      peer.on('connect', () =>{
        peer.removeListener('signal', onSignal);
        console.log('Peer connected.');
        onReady(remoteRoomMember, room);
      });
      if (!isInitiator) {
        peer.signal(sdpMsg.sdpObject);
      }
    };
    navigator.getUserMedia({ video: true, audio: false }, gotMedia, (error) => {
      console.log(error);
    });
  }

  init(onReady: Function, onMessage: Function){
    this.socketService.initSocket();

    this.socketService.onMessage().subscribe((data) =>{
      try {
        console.log(`SERVER -> CLIENT: ${data.substr(0, 80)}`);
        const message = JSON.parse(data) as TypedMessage;
        const chatActions =
          new ChatEvents(this, this.socketService, message, onReady, onMessage);
        const onError = () =>{
          throw new Error('Missing enum type or wrong message type!');
        };
        (chatActions[message.type] || onError).call(chatActions);
      } catch (err) {
        console.log(`[ERROR]: ${err}`);
      }
    });
  }

  close(){
    this.socketService.close();
  }

  register(){
    const newClientMsg = new NewUserMessage(this.userName);
    this.socketService.send(JSON.stringify(newClientMsg));

    const getUsersMsg = new UserListRequest();
    this.socketService.send(JSON.stringify(getUsersMsg));
  }

  getRoom(username: string): Room {
    return this.rooms.find(
      (room) => room.members.some(
        (member) => member.user.name === username
      )
    );
  }

  addVideoElements(streamVideo: any, receiveVideo: any){
    if (!this.streamVideo || !this.receiveVideo){
      this.streamVideo = streamVideo;
      this.receiveVideo = receiveVideo;
    }
  }
}

