import {Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as path from "path";
import {TypedMessage} from "./../../common/src/types";
import {MessageRouter} from "./chat.server";
import {User} from "./chat.types";

export class ChatServer {
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  private users: User[];

  constructor(){
    this.users = [];

    this.createApp();
    this.serveStaticFiles();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void{
    this.app = express();
  }

  private createServer(): void{
    const fs = require('fs');
    const http = require('http');
    const https = require('https');
    try {
      this.port = 443;
      const privateKey = fs.readFileSync('/home/bebe/ssl/jbalint_me.key', 'utf8');
      const certificate = fs.readFileSync('/home/bebe/ssl/jbalint_me.crt', 'utf8');
      const credentials = {key: privateKey, cert: certificate};
      this.server = https.createServer(credentials, this.app);
    } catch (err){
      console.log(err.toString());
      this.port = 80;
      this.server = http.createServer(this.app);
    }
  }

  private sockets(): void{
    this.io = socketIo(this.server);
  }

  private listen(): void{

    this.server.listen(this.port, () => {
      console.log('WebSocket running on port %s', this.port);
    });

    this.io.on('connect', (socket: any) =>{
      console.log('Connected client on port %s.', this.port);

      socket.on('message', (message: string) => {
        try {
          const clientMessage = JSON.parse(message) as TypedMessage;
          const router = new MessageRouter(this.users, socket, clientMessage);
          const onError = () =>{
            throw new Error('Missing enum type or wrong message type!');
          };
          (router[clientMessage.type] || onError).call(router);
        } catch (err){
          console.log(`[ERROR]: ${JSON.stringify(err)}`);
        }
      });

      socket.on('disconnect', () =>{
        console.log('Client disconnected.');
        for (let i = 0; i < this.users.length; ++i){
          const user: User = this.users[i];
          if (this.users[i].socket.id === socket.id){
            MessageRouter.DisconnectedUser(user);
            this.users.splice(i, 1);
            break;
          }
        }
      });
    });
  }

  public getApp(): express.Application{
    return this.app;
  }

  private serveStaticFiles(){
    const root: string = path.join(process.cwd(), '..', 'client', 'dist');
    this.app.use(express.static(root));
    this.app.use('/*', express.static(path.join(root, 'index.html')));
    console.log(`Serving static files at "${root}"`);

    this.app.all('/')
  }
}
