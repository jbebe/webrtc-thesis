import { Component, OnInit } from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from "../services/socket.service";
import {ClientMessage, MessageType, ServerMessage, TypedMessage} from "../socket.types";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public isNickNameInUse;

  constructor(
    public chatDataService: ChatDataService,
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute
    ) { }

  ngOnInit() {
    this.socketService.initSocket();
  }

  public enter(){
    const userNameHandler = (message: string) => {
      const serverMessage = JSON.parse(message) as ServerMessage;
      if (serverMessage.type === MessageType.IsUserNameUsed){
        console.log(`Server says nickname is: ${serverMessage.content}`);
        this.isNickNameInUse = serverMessage.content;
        if (!this.isNickNameInUse){
          this.socketService.unsubscribeMessage(userNameHandler);
          this.router.navigate(['main'], {}).catch(console.log);
        }
      }
    };
    this.socketService.onMessage().subscribe(userNameHandler, (error: any) => { throw new Error(error); });
    this.socketService.send(JSON.stringify(new ClientMessage(MessageType.IsUserNameUsed, this.chatDataService.nickname)));
  }

  // noinspection JSMethodCanBeStatic
  public validateName(name: string): boolean {
    return /^\w{4,}$/g.test(name);
  }

}
