
export class User {

  constructor(public name: string, public socket: any){

  }
}

export enum MessageType {

  // server side
  GetUsers = 'GetUsers',
  CreateNewUser = 'CreateNewUser',
  IsUserNameUsed = 'IsUserNameUsed',
  SDPExchange = 'SDPExchange',

  // client side
  NotifyNewUser = 'NotifyNewUser',
  UserList = 'UserList',
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

export class SdpExchangeServerMessage extends  TypedMessage {

  constructor(type: MessageType, public sdpObject: Object){
    super(type);
  }
}

export class SdpExchangeClientMessage extends SdpExchangeServerMessage {

  constructor(type: MessageType, sdpObject: Object, public toUserName: string){
    super(type, sdpObject);
  }
}
