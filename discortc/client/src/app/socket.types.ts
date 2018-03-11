
export class ClientUser {

  constructor(public name: string){

  }
}

export class ServerUser {

  constructor(public name: string, public socket: any){

  }
}

export enum MessageType {

  UserList = 'UserList',
  NewUser = 'NewUser',
  IsUserNameUsed = 'IsUserNameUsed',
  SDPExchange = 'SDPExchange',
}

export class TypedMessage {

  constructor(public type: MessageType){

  }
}

export class ClientMessage extends TypedMessage {

  constructor(type: MessageType, public content: any){
    super(type);
  }
}

export class ServerMessage extends ClientMessage {

}

export class SdpExchangeMessage extends ClientMessage {

  constructor(type: MessageType, user: string, public sdpObject: Object){
    super(type, user);
  }
}
