import {Component, OnInit} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {Room, RoomMember, User} from "../services/chat-data.types";

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

  constructor(public chatDataService: ChatDataService){
  }

  //
  // Angular hooks
  //

  ngOnInit(){

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
    this.showRoom(Room.Empty);
    const room = this.chatDataService.getChatRoom(recipientName);
    if (!room) {
      const remoteUser = this.chatDataService.getUser(recipientName);
      this.chatDataService.createRoom(remoteUser, true, this.loadRoomData.bind(this));
    } else {
      // TODO: ongoing conversation
      const roomMember = room.members.find((member) => member.user.name === recipientName);
      this.loadRoomData(roomMember, room);
    }
  }

  sendMessage(){
    const message = this.chatInput;
    console.log(message);
    this.activeChatRoom.sendMessage(this.currentUser, message);
    this.chatInput = '';
  }

  //
  // Helpers
  //

  private initChatServer(){
    this.chatDataService.init((roomMember, room) =>{
      this.isReadyToChat = true;
      this.activeChatRoom = room;
    });
  }

  private registerOnChatServer(){
    this.chatDataService.register();
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

  get currentUser(): User {
    return new User(this.chatDataService.nickname);
  }

}
