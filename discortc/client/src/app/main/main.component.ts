import {Component, OnInit, ApplicationRef} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {Message, Room, RoomMember, User} from "../services/chat-data.types";
import {Router} from "@angular/router";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  chatText = '';
  chatInput = '';

  isReadyToChat: boolean = false;

  constructor(
    public chatDataService: ChatDataService,
    private app: ApplicationRef,
    private router: Router
  ){
  }

  //
  // Angular hooks
  //

  ngOnInit(){

    if (this.chatDataService.userName === undefined){
      this.router.navigate([''], {}).catch(console.log);
    }

    this.initChatServer();

    this.registerOnChatServer();
  }

  ngOnDestroy(){
    this.chatDataService.close();
  }

  //
  // DOM Events
  //

  enterRoom(recipientName: string){
    this.isReadyToChat = false;
    this.showRoom(Room.Empty);
    const room = this.chatDataService.getChatRoom(recipientName);
    if (!room) {
      const remoteUser = this.chatDataService.getUser(recipientName);
      this.chatDataService.createRoom(remoteUser, true, this.loadRoomData.bind(this), () => {
        console.log('New message! TICK!');
        this.app.tick();
      });
    } else {
      const roomMember = room.members.find((member) => member.user.name === recipientName);
      this.loadRoomData(roomMember, room);
    }
  }

  sendMessage(){
    const message = this.chatInput;
    console.log(message);
    this.chatDataService.activeChatRoom.sendMessage(this.currentUser, message);
    this.chatInput = '';
  }

  isUserActive(username: string): Object {
    let activeClassObj = {
      'active': false
    };
    if (!!this.chatDataService.activeChatRoom){
      activeClassObj.active = this.chatDataService.activeChatRoom.members.some(
        (member) => member.user.name === username
      );
    }
    return activeClassObj;
  }

  isNewMessagePresent(username: string): boolean {
    const isActiveConversationWithUser = ((): boolean => {
      const activeChatRoom = this.chatDataService.activeChatRoom;
      if (activeChatRoom){
        return activeChatRoom.members.some(
          (member) => member.user.name === username
        );
      } else {
        return false;
      }
    })();
    if (isActiveConversationWithUser){
      return false;
    }
    return this.getNewMessageCount(username) > 0;
  }


  getNewMessageCount(username: string): number {
    const room = this.chatDataService.getRoom(username);
    if (room){
      const messageCount = room.messages.reduce((all: number, curr: Message) => all + (curr.seen ? 0 : 1), 0);
      console.log(`messages for ${username}: ${messageCount} pcs`);
      return messageCount;
    } else {
      console.log(`Cannot find room by username: ${username}`);
      return 0;
    }
  }

  //
  // Helpers
  //

  private initChatServer(){
    this.chatDataService.init((roomMember, room) =>{
      // do i have to warn someone about a new message here?
    }, (roomMember, room) => {
      this.app.tick();
    });
  }

  private registerOnChatServer(){
    this.chatDataService.register();
  }

  private showRoom(room: Room){
    console.log(room);
    this.chatDataService.activeChatRoom = room;
    room.messages.forEach((message: Message) => message.seen = true);
  }

  private loadRoomData(recipientMember: RoomMember, room: Room){
    console.log('Ready to chat!');
    this.showRoom(room);
    this.isReadyToChat = true;
  }

  get currentUser(): User {
    return new User(this.chatDataService.userName);
  }

}
