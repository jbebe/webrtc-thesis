import {
  ClientMessage,
  MessageType, SdpExchangeClientMessage, SdpExchangeServerMessage, ServerMessage, TypedMessage,
  User
} from "./types";

export class MessageRouter {

  [key:string]: any;

  constructor(private users: User[], private socket: any, private message: TypedMessage){
  }

  UserList(){
    const users = this.users.map((u) => ({ name: u.name }));
    const usersResponse = new ServerMessage(MessageType.UserList, users);
    console.log(`Server -> Client: ${JSON.stringify(users)}`);
    this.socket.emit('message', JSON.stringify(usersResponse));
  }

  SDPExchange(){
    const message = this.message as SdpExchangeClientMessage;
    const user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (user !== undefined){
      const recipient = MessageRouter.getUserByName(message.toUserName, this.users);
      console.log(`Server -> Client: <SDP Header>`);
      recipient.socket.emit('message', JSON.stringify(new SdpExchangeServerMessage(MessageType.SDPExchange, message.sdpObject)))
    }
  }

  NewUser(){
    const message = this.message as ClientMessage;
    const user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
    if (user === undefined){
      this.users.push(new User(message.content, this.socket));
      // warn others
      const newUserResponse = new ServerMessage(MessageType.NewUser, message.content);
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

  static getUserBySocketId(socketId: any, users: User[]): User | undefined {
    for (const user of users){
      if (user.socket.id === socketId){
        return user;
      }
    }
    return undefined;
  }

  static getUserByName(userName: any, users: User[]): User | undefined {
    for (const user of users){
      if (user.name === userName){
        return user;
      }
    }
    return undefined;
  }

  static isUsernameInList(username: string, users: User[]): boolean {
    return users.some((user: User) => user.name == username);
  }

};