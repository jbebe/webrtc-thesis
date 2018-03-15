import {Component, OnInit} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {SocketService} from "../services/socket.service";
import {
  TypedMessage,
  NewUserMessage,
  UserListRequest,
  SdpExchangeRequest
}
  from "../../../../common/src/types";
import {Room, RoomMember} from "../services/chat-data.types";
import * as Peer from 'simple-peer';
import {ChatEvents} from "./chat.events";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  chatText = '';
  chatInput = '';

  activeChatRoom: Room;
  isReadyToChat: boolean = false;

  constructor(public chatDataService: ChatDataService, private socketService: SocketService){
  }

  //
  // Angular hooks
  //

  ngOnInit(){

    this.initChatServer();

    this.registerOnChatServer();
  }

  ngOnDestroy(){
    this.socketService.close();
  }

  //
  // DOM Events
  //

  enterRoom(recipientName: string){
    this.showRoom(Room.Empty);
    const room = this.chatDataService.getChatRoom(recipientName);
    if (!room) {
      this.createRoom(recipientName, this.loadRoomData.bind(this));
    } else {
      // TODO: ongoing conversation
      const roomMember = room.members.find((member) => member.user.name === recipientName);
      this.loadRoomData(roomMember, room);
    }
  }

  sendMessage(){
    console.log(this.chatInput);
    this.activeChatRoom.sendMessage(this.chatInput);
    this.chatInput = '';
  }

  //
  // Helpers
  //

  private initChatServer(){
    this.socketService.initSocket();

    this.socketService.onMessage().subscribe((data) =>{
      try {
        console.log(`SERVER -> CLIENT: ${data.substr(0, 80)}`);
        const message = JSON.parse(data) as TypedMessage;
        const chatActions =
          new ChatEvents(this.chatDataService, this.socketService, message, (roomMember, room) =>{
            this.isReadyToChat = true;
            this.activeChatRoom = room;
        });
        const onError = () =>{
          throw new Error('Missing enum type or wrong message type!');
        };
        (chatActions[message.type] || onError).call(chatActions);
      } catch (err) {
        console.log(`[ERROR]: ${err}`);
      }
    });
  }

  private registerOnChatServer(){
    const newClientMsg = new NewUserMessage(this.chatDataService.nickname);
    this.socketService.send(JSON.stringify(newClientMsg));

    const getUsersMsg = new UserListRequest();
    this.socketService.send(JSON.stringify(getUsersMsg));
  }

  private showRoom(room: Room){
    console.log(room);
    this.activeChatRoom = room;
  }

  private loadRoomData(recipientMember: RoomMember, room: Room){
    console.log('Ready to chat!');
    this.showRoom(room);
    this.isReadyToChat = true;
  }

  private createRoom(recipientName: string, onReady: Function){
    console.log('Creating new peer as initiator.');
    const peer = new Peer({
      initiator: true,
      trickle: true,
      config: {
        iceServers: [
          {urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/]}
        ]
      },
    });
    const recipient = this.chatDataService.getUser(recipientName);
    const recipientMember = new RoomMember(recipient, peer);
    const room = new Room([recipientMember]);
    this.chatDataService.rooms.push(room);
    const onSignal = (sdpHeader) =>{
      console.log('SDP arrived from server.');
      if (!peer.connected) {
        const sdpExchangeMsg = JSON.stringify(new SdpExchangeRequest(recipientName, sdpHeader));
        console.log(`CLIENT -> SERVER: ${sdpExchangeMsg.substr(0, 80)}`);
        this.socketService.send(sdpExchangeMsg);
      }
    };
    peer.on('signal', onSignal);
    peer.on('error', (err) => {
      console.log(`[ERROR]: ${err}`);
    });
    peer.on('connect', () =>{
      // turn off signal sending
      peer.removeListener('signal', onSignal);
      console.log('Peer connected.');
      peer.send('I am the initiator!');
      onReady(recipientMember, room);
    });
    peer.on('data', function (data){
      console.log('data: ' + data)
    });
    peer.on('stream', function (stream){
      console.log('Stream arrived!');
    });
  }
}
