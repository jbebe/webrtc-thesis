import { Injectable } from '@angular/core';
import {ClientUser} from "../socket.types";
import {Room} from "./chat-data.types";

@Injectable()
export class ChatDataService {

  nickname: string;
  users: ClientUser[] = [];
  rooms: Room[] = [];

  constructor() { }

  getUser(remoteUser?: string){
    const username = remoteUser || this.nickname;
    for (const user of this.users){
      if (user.name === username){
        return user;
      }
    }
    return undefined;
  }

}
