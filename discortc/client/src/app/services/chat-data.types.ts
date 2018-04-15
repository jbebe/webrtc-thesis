import * as Peer from 'simple-peer';

export class User {
  constructor(public name: string){
  }
}

export class RoomMember {
  constructor(public user: User, public peerConnection: Peer, public stream: any = undefined){
  }
}

export class Message {
  constructor(
    public user: User,
    public content: string,
    private _timestamp: Date = null,
    public seen: boolean = false){
    this._timestamp = this._timestamp || new Date();
  }

  get timestamp(): string {
    return this._timestamp.toDateString();
  }
}

export class Room {
  constructor(public host: string, public members: RoomMember[], public messages: Message[] = []){
  }

  static get Empty() {
    return new Room(null,[]);
  }

  sendMessage(currentUser: User, chatInput: string){
    this.members.forEach((member) => {
      member.peerConnection.send(chatInput);
    });
    this.messages.push(new Message(currentUser, chatInput, null, true));
  }
}
