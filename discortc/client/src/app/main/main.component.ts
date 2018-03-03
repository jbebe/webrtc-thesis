import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {SocketService} from "../services/socket.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public chatDataService: ChatDataService, private socketService: SocketService) { }

  ngOnInit() {
    this.socketService.initSocket();
    this.socketService.send("HELLO");
    this.socketService.onMessage().subscribe((data) => {
      console.log(data);
    });
  }

  ngOnDestroy(){
    this.socketService.close();
  }

}
