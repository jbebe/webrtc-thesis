import {Component, OnInit} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {SocketService} from "../services/socket.service";
import {
  ClientMessage, MessageType, ServerMessage, TypedMessage,
  ClientUser, SdpExchangeMessage
} from "../socket.types";
import {Room, RoomMember} from "../services/chat-data.types";
import * as Peer from 'simple-peer';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  page = 'welcome';
  chatText = '';
  chatInput = '';

  constructor(public chatDataService: ChatDataService, private socketService: SocketService){
  }

  ngOnInit(){
    this.socketService.initSocket();

    this.socketService.onMessage().subscribe((data) =>{
      const message = JSON.parse(data) as TypedMessage;
      if (message.type === MessageType.UserList) {
        const serverMsg = message as ServerMessage;
        const users = [];
        serverMsg.content.forEach((u) =>{
          users.push(u as ClientUser)
        });
        this.chatDataService.users = users;
      } else if (message.type === MessageType.SDPExchange) {
        const sdpMsg = message as SdpExchangeMessage;
        const senderUser = this.chatDataService.getUser(sdpMsg.content); // sdpMsg content is the sender user
        // find sender in rooms to get its connection
        const senderRoomMember = (() =>{
          for (const room of this.chatDataService.rooms) {
            for (const member of room.members) {
              if (member.user.name === senderUser.name) {
                return member;
              }
            }
          }
          return undefined;
        })();
        // if senderRoomMember exists, we already built a connection, this is their response to our request
        if (senderRoomMember) {
          senderRoomMember.peerConnection.signal(sdpMsg.sdpObject);
        } else {
          // new call, we have to accept the peer offer
          const peer = new Peer({
            initiator: false,
            trickle: false,
            config: {
              iceServers: [
                {urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/]}
              ]
            },
          });
          peer.on('error', console.log);
          peer.on('connect', () =>{
            console.log('Peer connected');
            peer.send('I am the slave!');
          });
          peer.on('data', function (data){
            console.log('data: ' + data)
          });
          peer.on('stream', function (stream){
            console.log('Stream arrived!');
          });
          peer.on('signal', (sdpHeader) => {
            const senderRoomMember = new RoomMember(senderUser, peer);
            this.chatDataService.rooms.push(new Room([senderRoomMember]));
            const sdpExchangeMsg = new SdpExchangeMessage(MessageType.SDPExchange, senderUser.name, sdpHeader);
            this.socketService.send(JSON.stringify(sdpExchangeMsg));
          });
          peer.signal(sdpMsg.sdpObject);
        }
      } else if (message.type as MessageType === MessageType.UserList){
        const chatUsers = (message as ServerMessage).content as ClientUser[];
        this.chatDataService.users = chatUsers;
      } else if (message.type as MessageType === MessageType.NewUser) {
        const newUser = (message as ServerMessage).content as ClientUser;
        this.chatDataService.users.push(newUser);
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
    this.page = 'chatwindow';

    const recipient = this.chatDataService.getUser(userName);
    const room = (() =>{
      for (const room of this.chatDataService.rooms) {
        if (room.members.some((roomMember) => roomMember.user.name === recipient.name)) {
          return room;
        }
      }
      return undefined;
    })();
    if (room) {
      // TODO: ongoing conversation
    } else {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        config: {
          iceServers: [
            {urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/]}
          ]
        },
      });
      peer.on('error', console.log);
      peer.on('connect', () =>{
        console.log('Peer connected');
        peer.send('I am the initiator!');
      });
      peer.on('data', function (data){
        console.log('data: ' + data)
      });
      peer.on('stream', function (stream){
        console.log('Stream arrived!');
      });
      peer.on('signal', (sdpHeader) =>{
        const recipientMember = new RoomMember(recipient, peer);
        this.chatDataService.rooms.push(new Room([recipientMember]));
        const sdpExchangeMsg = new SdpExchangeMessage(MessageType.SDPExchange, userName, sdpHeader);
        this.socketService.send(JSON.stringify(sdpExchangeMsg));
      });
    }
  }

  sendMessage(){
    console.log(this.chatInput);

    this.chatInput = '';
  }

}
