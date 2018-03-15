import { Injectable } from '@angular/core';
import {User} from "../chat.types";
import {Room} from "./chat-data.types";

@Injectable()
export class ChatDataService {

  nickname: string;
  users: User[] = [];
  rooms: Room[] = [];

  constructor() { }

  getUser(remoteUser?: string){
    const username = remoteUser || this.nickname;
    for (const user of this.users){
      if (user.name === username){
        return user;
      }
    }
    return null;
  }

  getChatRoom(userName: string){
    return this.rooms.find(
      (room) => room.members.some(
        (member) => member.user.name === userName
      )
    );
  }

}
