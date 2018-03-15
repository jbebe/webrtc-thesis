import { ChatServer } from './socket.server';

let app = new ChatServer().getApp();
export { app };