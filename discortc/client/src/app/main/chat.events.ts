import {SocketService} from "../services/socket.service";
import {ChatDataService} from "../services/chat-data.service";
import {User} from "../chat.types";
import {
  TypedMessage,
  UserListResponse,
  SdpExchangeResponse,
  SdpExchangeRequest,
  NewUserMessage
}
  from "../../../../common/src/types";
import {Room, RoomMember} from "../services/chat-data.types";
import * as Peer from 'simple-peer';

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
      const peer = new Peer({
        initiator: false,
        trickle: true,
        config: {
          iceServers: [
            {urls: ['stun:tudor.sch.bme.hu:80'/*, 'turn:tudor.sch.bme.hu'*/]}
          ]
        },
      });
      peer.on('error', (err) => {
        console.log(`[ERROR]: ${err}`);
      });
      peer.on('data', function (data){
        console.log('data: ' + data)
      });
      peer.on('stream', function (stream){
        console.log('Stream arrived!');
      });
      const senderRoomMember = new RoomMember(senderUser, peer);
      const senderRoom = new Room([senderRoomMember]);
      this.chatDataService.rooms.push(new Room([senderRoomMember]));
      const onSignal = (sdpHeader) => {
        console.log('SDP arrived from server.');
        if (!peer.connected) {
          const sdpExchangeMsg = JSON.stringify(
            new SdpExchangeRequest(senderUser.name, sdpHeader)
          );
          console.log(`CLIENT -> SERVER: ${sdpExchangeMsg.substr(0, 80)}`);
          this.socketService.send(sdpExchangeMsg);
        }
      };
      peer.on('signal', onSignal);
      peer.on('connect', () => {
        console.log('Peer connected.');
        peer.send('I am the slave!');
        peer.removeListener('signal', onSignal);
        this.onReady(senderRoomMember, senderRoom);
      });
      // since this is the first sdp, we set the signal
      console.log('SDP object set for on request connection.');
      peer.signal(sdpMsg.sdpObject);
    }
  }

  NewUser(){
    this.chatDataService.users.push(
      new User((this.message as NewUserMessage).userName)
    );
  }

}
