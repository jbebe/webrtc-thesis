
export enum MessageType {
  UserList = 'UserList',
  NewUser = 'NewUser',
  DisconnectedUser = 'DisconnectedUser',
  IsUserNameUsed = 'IsUserNameUsed',
  SDPExchange = 'SDPExchange',
}

export class TypedMessage {
  constructor(public type: MessageType){
  }
}

//
// NewUser
//

export class NewUserMessage extends TypedMessage {
  constructor(public userName: string){
    super(MessageType.NewUser);
  }
}

//
// DisconnectedUser
//

export class DisconnectedUserMessage extends TypedMessage {
  constructor(public userName: string){
    super(MessageType.DisconnectedUser);
  }
}

//
// IsUserNameUsed
//

export class IsUserNameUsedRequest extends TypedMessage {
  constructor(public userName: string){
    super(MessageType.IsUserNameUsed);
  }
}

export class IsUserNameUsedResponse extends TypedMessage {
  constructor(public isUsed: boolean){
    super(MessageType.IsUserNameUsed);
  }
}

//
// UserList
//

export class UserListRequest extends TypedMessage {
  constructor(){
    super(MessageType.UserList);
  }
}

export class UserListResponse extends TypedMessage {
  constructor(public users: string[]){
    super(MessageType.UserList);
  }
}

//
// SDPExchange
//

export class SdpExchangeRequest extends TypedMessage {
  constructor(public toUser: string, public sdpObject: Object){
    super(MessageType.SDPExchange);
  }
}

export class SdpExchangeResponse extends TypedMessage {
  constructor(public fromUser: string, public sdpObject: Object){
    super(MessageType.SDPExchange);
  }
}
