import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {SocketService} from "../services/socket.service";
import {ClientMessage, MessageType} from "../socket.types";

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
      console.log(data);
    });

    const newClientMsg = new ClientMessage(MessageType.CreateNewUser, this.chatDataService.nickname);
    this.socketService.send(JSON.stringify(newClientMsg));

    const getUsersMsg = new ClientMessage(MessageType.GetUsers, null);
    this.socketService.send(JSON.stringify(getUsersMsg));
  }

  ngOnDestroy(){
    this.socketService.close();
  }

}
