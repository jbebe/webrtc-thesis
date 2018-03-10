import {
  ClientMessage,
  MessageType, SdpExchangeClientMessage, SdpExchangeServerMessage, ServerMessage, TypedMessage,
  User
} from "./types";

export class MessageRouter {

  [key:string]: any;

  constructor(private users: User[], private socket: any, private message: TypedMessage){

  }

  GetUsers(){
    const usersResponse = new ServerMessage(MessageType.UserList, JSON.stringify(this.users));
    this.socket.emit('message', JSON.stringify(usersResponse));
  }

  SDPExchange(){
    const message = this.message as SdpExchangeClientMessage;
    const user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (user !== undefined){
      const recipient = MessageRouter.getUserByName(message.toUserName, this.users);
      recipient.socket.emit('message', JSON.stringify(new SdpExchangeServerMessage(MessageType.SDPExchange, message.sdpObject)))
    }
  }

  CreateNewUser(){
    const message = this.message as ClientMessage;
    const user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (user === undefined){
      this.users.push(new User(message.content, this.socket));
      // warn others
      const newUserResponse = new ServerMessage(MessageType.NotifyNewUser, message.content);
      this.socket.broadcast.emit('message', JSON.stringify(newUserResponse));
    }
  }

  IsUserNameUsed(){
    const message = this.message as ClientMessage;
    const content = MessageRouter.isUsernameInList(message.content, this.users);
    const userInUseResponse = new ServerMessage(MessageType.IsUserNameUsed, content);
    this.socket.emit('message', JSON.stringify(userInUseResponse));
  }

  static getUserBySocketId(socketId: any, users: User[]){
    for (const user of users){
      if (user.socket.id === socketId){
        return user;
      }
    }
    return undefined;
  }

  static getUserByName(userName: any, users: User[]){
    for (const user of users){
      if (user.name === userName){
        return user;
      }
    }
    return undefined;
  }

  static isUsernameInList(username: string, users: User[]){
    users.some((user: User) => user.name == username);
  }

};