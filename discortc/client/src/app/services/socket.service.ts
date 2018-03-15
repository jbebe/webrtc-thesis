import {Injectable} from '@angular/core';
import * as socketIo from 'socket.io-client';
import {Observable} from "rxjs/Observable";
import Emitter = SocketIOClient.Emitter;

const SERVER_URL = 'http://127.0.0.1:80';

@Injectable()
export class SocketService {

  public socket: SocketIOClient.Socket;

  public initSocket(): void {
    if (!this.socket) {
      this.socket = socketIo(SERVER_URL);
    }
  }

  public send(message: string): void {
    this.socket.emit('message', message);
  }

  public unsubscribeMessage(fn: Function): Emitter {
    return this.socket.off('message', fn);
  }

  public unsubscribe(event: string, fn?: Function): Emitter {
    return this.socket.off(event, fn);
  }

  public onMessage(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('message', (data: string) => observer.next(data));
    });
  }

  public onEvent(event: string): Observable<any> {
    return new Observable<Event>(observer => {
      this.socket.on(event, () => observer.next());
    });
  }

  public close(){
    this.socket.close();
  }
}
