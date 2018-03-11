import {
  ClientMessage,
  MessageType, SdpExchangeMessage, ServerMessage, TypedMessage,
  ServerUser, ClientUser
} from "./types";

export class MessageRouter {

  [key:string]: any;

  constructor(private users: ServerUser[], private socket: any, private message: TypedMessage){
  }

  UserList(){
    const users = this.users.map((u) => new ClientUser(u.name));
    const usersResponse = new ServerMessage(MessageType.UserList, users);
    console.log(`Server -> Client: ${JSON.stringify(users)}`);
    this.socket.emit('message', JSON.stringify(usersResponse));
  }

  SDPExchange(){
    const senderUser = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (senderUser !== undefined){
      const message = this.message as SdpExchangeMessage;
      const toUser = MessageRouter.getUserByName(message.content, this.users);
      console.log(`Server -> Client: <SDP Header> (${senderUser.name} -> ${toUser.name})`);
      // we send the sdp to toUser with a label that shows it comes from senderUser
      toUser.socket.emit('message', JSON.stringify(new SdpExchangeMessage(MessageType.SDPExchange, senderUser.name, message.sdpObject)))
    }
  }

  NewUser(){
    const message = this.message as ClientMessage;
    const user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (user === undefined){
      this.users.push(new ServerUser(message.content, this.socket));
      // warn others
      const newUserResponse = new ServerMessage(MessageType.NewUser, new ClientUser(message.content));
      console.log(`Server -> Client[]: ${message.content}`);
      this.socket.broadcast.emit('message', JSON.stringify(newUserResponse));
    }
  }

  IsUserNameUsed(){
    const message = this.message as ClientMessage;
    const content = MessageRouter.isUsernameInList(message.content, this.users);
    const userInUseResponse = new ServerMessage(MessageType.IsUserNameUsed, content);
    console.log(`Server -> Client: ${content}`);
    this.socket.emit('message', JSON.stringify(userInUseResponse));
  }

  static getUserBySocketId(socketId: any, users: ServerUser[]): ServerUser | undefined {
    for (const user of users){
      if (user.socket.id === socketId){
        return user;
      }
    }
    return undefined;
  }

  static getUserByName(userName: any, users: ServerUser[]): ServerUser | undefined {
    for (const user of users){
      if (user.name === userName){
        return user;
      }
    }
    return undefined;
  }

  static isUsernameInList(username: string, users: ServerUser[]): boolean {
    return users.some((user: ServerUser) => user.name == username);
  }

}