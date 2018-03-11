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
var ClientUser = /** @class */ (function () {
    function ClientUser(name) {
        this.name = name;
    }
    return ClientUser;
}());
exports.ClientUser = ClientUser;
var ServerUser = /** @class */ (function () {
    function ServerUser(name, socket) {
        this.name = name;
        this.socket = socket;
    }
    return ServerUser;
}());
exports.ServerUser = ServerUser;
var MessageType;
(function (MessageType) {
    MessageType["UserList"] = "UserList";
    MessageType["NewUser"] = "NewUser";
    MessageType["IsUserNameUsed"] = "IsUserNameUsed";
    MessageType["SDPExchange"] = "SDPExchange";
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
var SdpExchangeMessage = /** @class */ (function (_super) {
    __extends(SdpExchangeMessage, _super);
    function SdpExchangeMessage(type, user, sdpObject) {
        var _this = _super.call(this, type, user) || this;
        _this.sdpObject = sdpObject;
        return _this;
    }
    return SdpExchangeMessage;
}(ClientMessage));
exports.SdpExchangeMessage = SdpExchangeMessage;
