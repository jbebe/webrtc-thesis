import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import * as path from "path";
import {ClientMessage, MessageType, ServerMessage, User} from "./types";

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

      socket.on('message', (m: ClientMessage) => {
        console.log('Client -> Server: %s', m);
        const isUsernameInList = (username: string) =>
          this.users.some((user: User) => user.name == username);
        switch (m.type) {
          case MessageType.IsUsernameAlreadyInUse:
            const content = String(isUsernameInList(m.content));
            const userInUseResponse = new ServerMessage(MessageType.IsUsernameAlreadyInUse, content);
            socket.emit('message', JSON.stringify(userInUseResponse));
            break;
          case MessageType.RegisterNewUser:
            if (!isUsernameInList(m.content)){
              this.users.push(new User(m.content, socket.id));
            }
            const newUserResponse = new ServerMessage(MessageType.NewUser, m.content);
            socket.broadcast.emit('message', JSON.stringify(newUserResponse));
            break;
          case MessageType.GetUsers:
            const usersResponse = new ServerMessage(MessageType.UserList, JSON.stringify(this.users));
            socket.emit('message', JSON.stringify(usersResponse));
            break;
          case MessageType.InitiateSDPExchange:
            if (isUsernameInList(m.content)){
              // const recipient = this.users.)
            }
            break;
          default:
            throw new Error('Missing enum type or wrong client message type!');
        }
      });

      socket.on('disconnect', () =>{

        console.log('Client disconnected.');
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
