import { ChatServer } from './socketServer';

let app = new ChatServer().getApp();
export { app };