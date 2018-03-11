import {ClientUser} from "../socket.types";
import * as Peer from 'simple-peer';

export class RoomMember {

  constructor(public user: ClientUser, public peerConnection: Peer){

  }
}

export class Room {

  constructor(public members: RoomMember[]){

  }

}
