"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(name, socket) {
        this.name = name;
        this.socket = socket;
    }
    return User;
}());
exports.User = User;
var MessageType;
(function (MessageType) {
    // server side
    MessageType["GetUsers"] = "GetUsers";
    MessageType["CreateNewUser"] = "CreateNewUser";
    MessageType["IsUserNameUsed"] = "IsUserNameUsed";
    MessageType["SDPExchange"] = "SDPExchange";
    // client side
    MessageType["NotifyNewUser"] = "NotifyNewUser";
    MessageType["UserList"] = "UserList";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var TypedMessage = /** @class */ (function () {
    function TypedMessage(type) {
        this.type = type;
    }
    return TypedMessage;
}());
exports.TypedMessage = TypedMessage;
var ClientMessage = /** @class */ (function (_super) {
    __extends(ClientMessage, _super);
    function ClientMessage(type, content) {
        var _this = _super.call(this, type) || this;
        _this.content = content;
        return _this;
    }
    return ClientMessage;
}(TypedMessage));
exports.ClientMessage = ClientMessage;
var ServerMessage = /** @class */ (function (_super) {
    __extends(ServerMessage, _super);
    function ServerMessage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ServerMessage;
}(ClientMessage));
exports.ServerMessage = ServerMessage;
var SdpExchangeServerMessage = /** @class */ (function (_super) {
    __extends(SdpExchangeServerMessage, _super);
    function SdpExchangeServerMessage(type, sdpObject) {
        var _this = _super.call(this, type) || this;
        _this.sdpObject = sdpObject;
        return _this;
    }
    return SdpExchangeServerMessage;
}(TypedMessage));
exports.SdpExchangeServerMessage = SdpExchangeServerMessage;
var SdpExchangeClientMessage = /** @class */ (function (_super) {
    __extends(SdpExchangeClientMessage, _super);
    function SdpExchangeClientMessage(type, sdpObject, toUserName) {
        var _this = _super.call(this, type, sdpObject) || this;
        _this.toUserName = toUserName;
        return _this;
    }
    return SdpExchangeClientMessage;
}(SdpExchangeServerMessage));
exports.SdpExchangeClientMessage = SdpExchangeClientMessage;
