import {SocketService} from "../services/socket.service";
import {ChatDataService} from "../services/chat-data.service";
import {
  TypedMessage,
  UserListResponse,
  SdpExchangeResponse,
  NewUserMessage
}
  from "../../../../common/src/types";
import {Room, RoomMember, User} from "../services/chat-data.types";

export class ChatEvents {

  constructor(private chatDataService: ChatDataService,
              private socketService: SocketService,
              private message: TypedMessage,
              private onReady: Function){
  }

  UserList(){
    const userListMsg = this.message as UserListResponse;
    this.chatDataService.users = userListMsg.users
      .map((name) => new User(name));
  }

  SDPExchange(){
    const sdpMsg = this.message as SdpExchangeResponse;
    const senderUser = this.chatDataService.getUser(sdpMsg.fromUser);

    // find sender in rooms to get its connection
    const [senderRoomMember, senderRoom] = ((): [RoomMember, Room] =>{
      for (const room of this.chatDataService.rooms) {
        for (const member of room.members) {
          if (member.user.name === senderUser.name) {
            return [member, room];
          }
        }
      }
      return [null, null];
    })();
    if (senderRoomMember) {
      // if senderRoomMember exists, we already built a connection,
      // this is their response to our request, we just have to set
      // the incoming sdp header and the signaling is done
      console.log('SDP object set for existing room member.');
      senderRoomMember.peerConnection.signal(sdpMsg.sdpObject);
    } else {
      // new call, we have to accept the peer offer and create a room
      console.log('Create new peer on request.');
      this.chatDataService.createRoom(senderUser, false, this.onReady, sdpMsg);
    }
  }

  NewUser(){
    this.chatDataService.users.push(
      new User((this.message as NewUserMessage).userName)
    );
  }

}
