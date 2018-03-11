"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var MessageRouter = /** @class */ (function () {
    function MessageRouter(users, socket, message) {
        this.users = users;
        this.socket = socket;
        this.message = message;
    }
    MessageRouter.prototype.UserList = function () {
        var users = this.users.map(function (u) { return new types_1.ClientUser(u.name); });
        var usersResponse = new types_1.ServerMessage(types_1.MessageType.UserList, users);
        console.log("Server -> Client: " + JSON.stringify(users));
        this.socket.emit('message', JSON.stringify(usersResponse));
    };
    MessageRouter.prototype.SDPExchange = function () {
        var senderUser = MessageRouter.getUserBySocketId(this.socket.id, this.users);
        if (senderUser !== undefined) {
            var message = this.message;
            var toUser = MessageRouter.getUserByName(message.content, this.users);
            console.log("Server -> Client: <SDP Header> (" + senderUser.name + " -> " + toUser.name + ")");
            // we send the sdp to toUser with a label that shows it comes from senderUser
            toUser.socket.emit('message', JSON.stringify(new types_1.SdpExchangeMessage(types_1.MessageType.SDPExchange, senderUser.name, message.sdpObject)));
        }
    };
    MessageRouter.prototype.NewUser = function () {
        var message = this.message;
        var user = MessageRouter.getUserBySocketId(this.socket.id, this.users);
        if (user === undefined) {
            this.users.push(new types_1.ServerUser(message.content, this.socket));
            // warn others
            var newUserResponse = new types_1.ServerMessage(types_1.MessageType.NewUser, new types_1.ClientUser(message.content));
            console.log("Server -> Client[]: " + message.content);
            this.socket.broadcast.emit('message', JSON.stringify(newUserResponse));
        }
    };
    MessageRouter.prototype.IsUserNameUsed = function () {
        var message = this.message;
        var content = MessageRouter.isUsernameInList(message.content, this.users);
        var userInUseResponse = new types_1.ServerMessage(types_1.MessageType.IsUserNameUsed, content);
        console.log("Server -> Client: " + content);
        this.socket.emit('message', JSON.stringify(userInUseResponse));
    };
    MessageRouter.getUserBySocketId = function (socketId, users) {
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            if (user.socket.id === socketId) {
                return user;
            }
        }
        return undefined;
    };
    MessageRouter.getUserByName = function (userName, users) {
        for (var _i = 0, users_2 = users; _i < users_2.length; _i++) {
            var user = users_2[_i];
            if (user.name === userName) {
                return user;
            }
        }
        return undefined;
    };
    MessageRouter.isUsernameInList = function (username, users) {
        return users.some(function (user) { return user.name == username; });
    };
    return MessageRouter;
}());
exports.MessageRouter = MessageRouter;
