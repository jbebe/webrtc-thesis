import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as path from "path";
import {TypedMessage} from "./../../common/src/types";
import {MessageRouter} from "./chat.server";
import {User} from "./chat.types";

export class ChatServer {
  public static readonly PORT: number = 80;
  private app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;

  private users: User[];

  constructor(){
    this.users = [];

    this.createApp();
    this.config();
    this.serveStaticFiles();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void{
    this.app = express();
  }

  private createServer(): void{
    this.server = createServer(this.app);
  }

  private config(): void{
    this.port = ChatServer.PORT || process.env.PORT;
  }

  private sockets(): void{
    this.io = socketIo(this.server);
  }

  private listen(): void{

    this.server.listen(this.port, () =>{
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
          if (this.users[i].socket.id === socket.id){
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
    console.log(`Serving static files at "${root}"`);

    this.app.all('/')
  }
}
