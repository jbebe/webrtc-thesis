import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {SocketService} from "../services/socket.service";
import {
  ClientMessage, MessageType, SdpExchangeClientMessage, SdpExchangeServerMessage, ServerMessage, TypedMessage,
  User
} from "../socket.types";
import {Room, RoomMember} from "../services/chat-data.types";
import * as Peer from 'simple-peer';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public chatDataService: ChatDataService, private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.initSocket();

    this.socketService.onMessage().subscribe((data) => {
      const message = JSON.parse(data) as ServerMessage;
      if (message.type === MessageType.UserList){
        const users = [];
        message.content.forEach((u) => { users.push(u as User) });
        this.chatDataService.users = users;
      } else if (message.type === MessageType.SDPExchange){
        // const
      }
      console.log(data);
    });

    const newClientMsg = new ClientMessage(MessageType.NewUser, this.chatDataService.nickname);
    this.socketService.send(JSON.stringify(newClientMsg));

    const getUsersMsg = new ClientMessage(MessageType.UserList, null);
    this.socketService.send(JSON.stringify(getUsersMsg));
  }

  ngOnDestroy(){
    this.socketService.close();
  }

  enterRoom(userName: string){
    const client = this.chatDataService.getUser();
    const room = (() => {
      for (const room of this.chatDataService.rooms){
        if (room.members.some((roomMember) => roomMember.user.name === client.name)){
          return room;
        }
      }
      return undefined;
    })();
    if (room){

    } else {
      const onGotMedia = (stream) =>{
        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [
              { urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/] }
              ]
          },
        });
        peer.on('error', console.log);
        peer.on('signal', (sdpHeader) => {
          const clientMember = new RoomMember(client, peer);
          this.chatDataService.rooms.push(new Room([clientMember]));
          const sdpExchangeMsg = new SdpExchangeClientMessage(MessageType.SDPExchange, sdpHeader, userName);
          const onSdpExchangeResponse = (data) => {
            const message = JSON.parse(data) as TypedMessage;
            if (message.type === MessageType.SDPExchange) {
              const serverMessage = message as SdpExchangeServerMessage;
              peer.on('connect', () => {
                console.log('Peer connected');
              });
              peer.on('data', function (data){
                console.log('data: ' + data)
              });
              peer.on('stream', function (stream) {
                console.log('Stream arrived!');
              });
              peer.signal(serverMessage.sdpObject);
            }
          };
          this.socketService.onMessage().subscribe(onSdpExchangeResponse, console.log);
          this.socketService.send(JSON.stringify(sdpExchangeMsg));
        });
      };
      navigator.getUserMedia({ video: true, audio: false }, onGotMedia, console.log);
    }
  }

}
