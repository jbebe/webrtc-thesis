
export class User {

  constructor(public name: string, public id: any){

  }
}

export enum MessageType {
  GetUsers = 1,
  RegisterNewUser = 2,
  IsUsernameAlreadyInUse = 3,
  NewUser = 4,
  UserList = 5,
  InitiateSDPExchange = 6
}

export class ClientMessage {

  constructor(public type: MessageType, public content: string){

  }
}

export class ServerMessage extends ClientMessage {

}