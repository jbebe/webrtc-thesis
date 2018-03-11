"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var path = require("path");
var chatServer_1 = require("./chatServer");
var ChatServer = /** @class */ (function () {
    function ChatServer() {
        this.users = [];
        this.createApp();
        this.config();
        this.serveStaticFiles();
        this.createServer();
        this.sockets();
        this.listen();
    }
    ChatServer.prototype.createApp = function () {
        this.app = express();
    };
    ChatServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    ChatServer.prototype.config = function () {
        this.port = ChatServer.PORT || process.env.PORT;
    };
    ChatServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    ChatServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('WebSocket running on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            socket.on('message', function (message) {
                console.log("Client -> Server: " + message);
                var clientMessage = JSON.parse(message);
                var router = new chatServer_1.MessageRouter(_this.users, socket, clientMessage);
                var onError = function () {
                    throw new Error('Missing enum type or wrong client message type!');
                };
                (router[clientMessage.type] || onError).call(router);
            });
            socket.on('disconnect', function () {
                console.log('Client disconnected.');
                for (var i = 0; i < _this.users.length; ++i) {
                    if (_this.users[i].socket.id === socket.id) {
                        _this.users.splice(i, 1);
                        break;
                    }
                }
            });
        });
    };
    ChatServer.prototype.getApp = function () {
        return this.app;
    };
    ChatServer.prototype.serveStaticFiles = function () {
        var root = path.join(process.cwd(), '..', 'client', 'dist');
        this.app.use(express.static(root));
        console.log("Serving static files at \"" + root + "\"");
        this.app.all('/');
    };
    ChatServer.PORT = 80;
    return ChatServer;
}());
exports.ChatServer = ChatServer;
