import {
  SdpExchangeRequest,
  SdpExchangeResponse,
  TypedMessage,
  IsUserNameUsedRequest,
  IsUserNameUsedResponse,
  NewUserMessage,
  UserListResponse
} from "./../../common/src/types";
import {User} from "./chat.types";

export class MessageRouter {

  [key: string]: any;

  private currentUser: User;

  constructor(private users: User[], private socket: any, private message: TypedMessage){
    this.currentUser = MessageRouter.getUserBySocketId(socket.id, this.users);
  }

  UserList(){
    if (!this.currentUser) {
      return;
    }
    const users: string[] = this.users
      .map((u) => u.name)
      .filter((n) => n !== this.currentUser.name);
    const usersResponse = JSON.stringify(new UserListResponse(users));
    console.log(`Server -> Client: ${users}`);
    this.socket.emit('message', usersResponse);
  }

  SDPExchange(){
    if (this.currentUser) {
      const message = this.message as SdpExchangeRequest;
      const toUser = MessageRouter.getUserByName(message.toUser, this.users);
      const responseToRecipient = JSON.stringify(
        new SdpExchangeResponse(this.currentUser.name, message.sdpObject)
      );
      console.log(`Server -> Client: <SDP Header> (${this.currentUser.name} -> ${toUser.name})`);
      toUser.socket.emit('message', responseToRecipient);
    }
  }

  NewUser(){
    const message = this.message as NewUserMessage;
    if (this.currentUser === null) {
      this.users.push(new User(message.userName, this.socket));
      // warn others
      const newUserResponse = JSON.stringify(new NewUserMessage(message.userName));
      console.log(`Server -> Client[]: ${newUserResponse}`);
      this.socket.broadcast.emit('message', newUserResponse);
    }
  }

  IsUserNameUsed(){
    const message = this.message as IsUserNameUsedRequest;
    const isUsed = MessageRouter.isUsernameInList(message.userName, this.users);
    const userInUseResponse = JSON.stringify(new IsUserNameUsedResponse(isUsed));
    console.log(`Server -> Client: ${userInUseResponse}`);
    this.socket.emit('message', userInUseResponse);
  }

  static getUserBySocketId(socketId: any, users: User[]): User | null{
    for (const user of users) {
      if (user.socket.id === socketId) {
        return user;
      }
    }
    return null;
  }

  static getUserByName(userName: string, users: User[]): User | null{
    for (const user of users) {
      if (user.name === userName) {
        return user;
      }
    }
    return null;
  }

  static isUsernameInList(username: string, users: User[]): boolean{
    return users.some((user: User) => user.name == username);
  }

}