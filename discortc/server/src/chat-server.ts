import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import * as path from "path";
import {hostname} from "os";

export class ChatServer {
    public static readonly PORT:number = 80;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;

    constructor() {
        this.createApp();
        this.config();
        this.serveStaticFiles();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = ChatServer.PORT || process.env.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);
            socket.on('message', (m: string) => {
                console.log('[server](message): %s', m);
                this.io.emit('message', m);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    private serveStaticFiles() {
        const root: string = path.join(process.cwd(), '..', '..', 'client', 'dist');
        this.app.use(express.static(root));
        console.log(`Serving static files at "${root}"`);

        this.app.all('/')
    }
}
