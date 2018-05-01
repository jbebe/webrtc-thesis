import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from "../services/socket.service";
import {MessageType, IsUserNameUsedRequest, IsUserNameUsedResponse} from "../../../../common/src/types";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public isNickNameInUse;
  public loginHappening = false;
  @ViewChild('nameInput') private input: ElementRef;

  constructor(
    public chatDataService: ChatDataService,
    private socketService: SocketService,
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2
    ) { }

  ngOnInit() {
    this.socketService.initSocket();
  }

  ngAfterViewInit(){
    this.renderer.selectRootElement(this.input["nativeElement"]).focus();
  }

  public enter(){
    if (this.loginHappening){
      return;
    } else {
      this.loginHappening = true;
    }
    const userName = this.chatDataService.userName;
    if (!this.validateName(userName)){
      return;
    }
    const userNameHandler = (message: string) => {
      const serverMessage = JSON.parse(message) as IsUserNameUsedResponse;
      if (serverMessage.type === MessageType.IsUserNameUsed){
        console.log(`Is nickname used: ${serverMessage.isUsed}`);
        this.isNickNameInUse = serverMessage.isUsed;
        if (!this.isNickNameInUse){
          this.socketService.unsubscribeMessage(userNameHandler);
          this.router.navigate(['main'], {}).catch(console.log);
        } else {
          this.loginHappening = false;
        }
      }
    };
    this.socketService.onMessage().subscribe(
      userNameHandler,
      (error: any) => { throw new Error(error); }
      );
    this.socketService.send(JSON.stringify(new IsUserNameUsedRequest(userName)));
  }

  // noinspection JSMethodCanBeStatic
  public validateName(name: string): boolean {
    return /^\w{4,}$/g.test(name);
  }

}
