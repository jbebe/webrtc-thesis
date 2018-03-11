import {User} from "../socket.types";
import * as Peer from 'simple-peer';

export class RoomMember {

  constructor(public user: User, public peerConnection: Peer){

  }
}

export class Room {

  constructor(public members: RoomMember[]){

  }

}
