import {Component, OnInit, ApplicationRef, ViewChild, ElementRef} from '@angular/core';
import {ChatDataService} from "../services/chat-data.service";
import {Message, Room, RoomMember, User} from "../services/chat-data.types";
import {Router} from "@angular/router";
import {EventEmitter} from "events";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  chatText = '';
  chatInput = '';

  isReadyToChat: boolean = false;

  private  streamVideo: ElementRef;
  private receiveVideo: ElementRef;
  private elementArrived = new EventEmitter();

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

    this.redirectIfDirectLink();

    this.initChatServer();

    this.registerOnChatServer();
  }

  /*ngAfterViewInit(){
    this.chatDataService.addVideoElements(
      [this.streamVideo.nativeElement, this.receiveVideo.nativeElement]
    );
    setTimeout(() => {
      console.log(this.streamVideo);
    }, 2000);
  }*/

  ngOnDestroy(){
    this.chatDataService.close();
  }

  //
  // DOM Events
  //

  enterRoom(recipientName: string){
    this.isReadyToChat = false;
    this.showRoom(Room.Empty);
    const enterRoomVideoReady = () =>{
      this.chatDataService.addVideoElements(
        this.streamVideo.nativeElement, this.receiveVideo.nativeElement
      );
      const room = this.chatDataService.getChatRoom(recipientName);
      if (!room) {
        const remoteUser = this.chatDataService.getUser(recipientName);
        this.chatDataService.createRoom(remoteUser, true, this.loadRoomData.bind(this), () =>{
          console.log('New message! TICK!');
          this.app.tick();
        });
      } else {
        const roomMember = room.members.find((member) => member.user.name === recipientName);
        this.loadRoomData(roomMember, room);
      }
    };
    if (this.isVideoElementsReady()){
      enterRoomVideoReady();
    } else {
      this.elementArrived.on('videoElementsReady', enterRoomVideoReady);
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

  addToCurrentRoom(username: string){
    const user = this.chatDataService.getUser(username);
    if (user === null){
      return;
    }
    this.chatDataService.createNewPeer(user, this.chatDataService.activeChatRoom);
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
    console.log(recipientMember.stream, this.receiveVideo);
    if (recipientMember.stream && this.receiveVideo){
      this.receiveVideo.nativeElement.srcObject = recipientMember.stream;
      this.receiveVideo.nativeElement.play();
    }
  }

  get currentUser(): User {
    return new User(this.chatDataService.userName);
  }

  private redirectIfDirectLink(){
    if (this.chatDataService.userName === undefined){
      this.router.navigate([''], {}).catch(console.log);
    }
  }

  private isVideoElementsReady(): boolean {
    return !!this.streamVideo && !!this.receiveVideo;
  }

  public getActiveRoomMemberList(): string[] {
    return this.chatDataService.activeChatRoom.members.map((member) => member.user.name);
  }

  public isUserAvailableToJoin(user: User): boolean {
    return (
      !!this.chatDataService.activeChatRoom &&
      this.isReadyToChat &&
      !this.chatDataService.activeChatRoom.members.some(
        (member) => member.user.name === user.name
      )
    );
  }

  //
  // Setter for ngIf-ed DOM elements
  //

  @ViewChild('streamVideo') set setStreamVideo(element: ElementRef) {
    this.streamVideo = element;
    if (element){
      if (this.chatDataService.localStream){
        this.streamVideo.nativeElement.srcObject = this.chatDataService.localStream;
        this.streamVideo.nativeElement.play();
      }
      if (this.isVideoElementsReady()) {
        this.elementArrived.emit('videoElementsReady');
      }
    }
    console.log(`streamVideo element: ${element}`);
  }

  @ViewChild('receiveVideo') set setReceiveVideo(element: ElementRef) {
    this.receiveVideo = element;
    if (element){
      if (this.chatDataService.localStream){
        this.streamVideo.nativeElement.srcObject = this.chatDataService.localStream;
        this.streamVideo.nativeElement.play();
      }
      if (this.isVideoElementsReady()) {
        this.elementArrived.emit('videoElementsReady');
      }
    }
    console.log(`receiveVideo element: ${element}`);
  }

}
