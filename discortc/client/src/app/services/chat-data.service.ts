import { Injectable } from '@angular/core';
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

  nickname: string;
  users: User[] = [];
  rooms: Room[] = [];

  constructor(private socketService: SocketService) { }

  getUser(remoteUser?: string){
    const username = remoteUser || this.nickname;
    for (const user of this.users){
      if (user.name === username){
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

  createRoom(remoteUser: User, isInitiator: boolean, onReady: Function, sdpMsg: SdpExchangeResponse = null){
    const peer = new Peer({
      initiator: isInitiator,
      trickle: true,
      config: {
        iceServers: [
          {urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/]}
        ]
      },
    });

    const remoteRoomMember = new RoomMember(remoteUser, peer);
    const room = new Room([remoteRoomMember]);
    this.rooms.push(room);
    const onSignal = (sdpHeader) => {
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
    peer.on('error', (err) => {
      console.log(`[ERROR]: ${err}`);
    });
    peer.on('data', function (data){
      room.messages.push(new Message(remoteUser, data));
      console.log('data: ' + data)
    });
    peer.on('stream', function (stream){
      console.log('Stream arrived!');
    });
    peer.on('connect', () => {
      peer.removeListener('signal', onSignal);
      console.log('Peer connected.');
      onReady(remoteRoomMember, room);
    });
    if (!isInitiator){
      peer.signal(sdpMsg.sdpObject);
    }
  }

  init(onReady: Function){
    this.socketService.initSocket();

    this.socketService.onMessage().subscribe((data) =>{
      try {
        console.log(`SERVER -> CLIENT: ${data.substr(0, 80)}`);
        const message = JSON.parse(data) as TypedMessage;
        const chatActions =
          new ChatEvents(this, this.socketService, message, onReady);
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
    const newClientMsg = new NewUserMessage(this.nickname);
    this.socketService.send(JSON.stringify(newClientMsg));

    const getUsersMsg = new UserListRequest();
    this.socketService.send(JSON.stringify(getUsersMsg));
  }
}

