import {User} from "../chat.types";
import * as Peer from 'simple-peer';

export class RoomMember {
  constructor(public user: User, public peerConnection: Peer){
  }
}

export class Room {
  constructor(public members: RoomMember[]){
  }

  static get Empty() {
    return new Room([]);
  }

  sendMessage(chatInput: string){
    this.members.forEach((member) => {
      member.peerConnection.send(chatInput);
    });
  }
}
