"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./../../common/src/types");
var chat_types_1 = require("./chat.types");
var MessageRouter = /** @class */ (function () {
    function MessageRouter(users, socket, message) {
        this.users = users;
        this.socket = socket;
        this.message = message;
        this.currentUser = MessageRouter.getUserBySocketId(socket.id, this.users);
    }
    MessageRouter.prototype.UserList = function () {
        var _this = this;
        if (!this.currentUser) {
            return;
        }
        var users = this.users
            .map(function (u) { return u.name; })
            .filter(function (n) { return n !== _this.currentUser.name; });
        var usersResponse = JSON.stringify(new types_1.UserListResponse(users));
        console.log("Server -> Client: " + users);
        this.socket.emit('message', usersResponse);
    };
    MessageRouter.prototype.SDPExchange = function () {
        if (this.currentUser) {
            var message = this.message;
            var toUser = MessageRouter.getUserByName(message.toUser, this.users);
            var responseToRecipient = JSON.stringify(new types_1.SdpExchangeResponse(this.currentUser.name, message.sdpObject));
            console.log("Server -> Client: <SDP Header> (" + this.currentUser.name + " -> " + toUser.name + ")");
            toUser.socket.emit('message', responseToRecipient);
        }
    };
    MessageRouter.prototype.NewUser = function () {
        var message = this.message;
        if (this.currentUser === null) {
            this.users.push(new chat_types_1.User(message.userName, this.socket));
            // warn others
            var newUserResponse = JSON.stringify(new types_1.NewUserMessage(message.userName));
            console.log("Server -> Client[]: " + newUserResponse);
            this.socket.broadcast.emit('message', newUserResponse);
        }
    };
    MessageRouter.prototype.IsUserNameUsed = function () {
        var message = this.message;
        var isUsed = MessageRouter.isUsernameInList(message.userName, this.users);
        var userInUseResponse = JSON.stringify(new types_1.IsUserNameUsedResponse(isUsed));
        console.log("Server -> Client: " + userInUseResponse);
        this.socket.emit('message', userInUseResponse);
    };
    MessageRouter.getUserBySocketId = function (socketId, users) {
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            if (user.socket.id === socketId) {
                return user;
            }
        }
        return null;
    };
    MessageRouter.getUserByName = function (userName, users) {
        for (var _i = 0, users_2 = users; _i < users_2.length; _i++) {
            var user = users_2[_i];
            if (user.name === userName) {
                return user;
            }
        }
        return null;
    };
    MessageRouter.isUsernameInList = function (username, users) {
        return users.some(function (user) { return user.name == username; });
    };
    return MessageRouter;
}());
exports.MessageRouter = MessageRouter;
