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
//
// NewUser
//
var NewUserMessage = /** @class */ (function (_super) {
    __extends(NewUserMessage, _super);
    function NewUserMessage(userName) {
        var _this = _super.call(this, MessageType.NewUser) || this;
        _this.userName = userName;
        return _this;
    }
    return NewUserMessage;
}(TypedMessage));
exports.NewUserMessage = NewUserMessage;
//
// IsUserNameUsed
//
var IsUserNameUsedRequest = /** @class */ (function (_super) {
    __extends(IsUserNameUsedRequest, _super);
    function IsUserNameUsedRequest(userName) {
        var _this = _super.call(this, MessageType.IsUserNameUsed) || this;
        _this.userName = userName;
        return _this;
    }
    return IsUserNameUsedRequest;
}(TypedMessage));
exports.IsUserNameUsedRequest = IsUserNameUsedRequest;
var IsUserNameUsedResponse = /** @class */ (function (_super) {
    __extends(IsUserNameUsedResponse, _super);
    function IsUserNameUsedResponse(isUsed) {
        var _this = _super.call(this, MessageType.IsUserNameUsed) || this;
        _this.isUsed = isUsed;
        return _this;
    }
    return IsUserNameUsedResponse;
}(TypedMessage));
exports.IsUserNameUsedResponse = IsUserNameUsedResponse;
//
// UserList
//
var UserListRequest = /** @class */ (function (_super) {
    __extends(UserListRequest, _super);
    function UserListRequest() {
        return _super.call(this, MessageType.UserList) || this;
    }
    return UserListRequest;
}(TypedMessage));
exports.UserListRequest = UserListRequest;
var UserListResponse = /** @class */ (function (_super) {
    __extends(UserListResponse, _super);
    function UserListResponse(users) {
        var _this = _super.call(this, MessageType.UserList) || this;
        _this.users = users;
        return _this;
    }
    return UserListResponse;
}(TypedMessage));
exports.UserListResponse = UserListResponse;
//
// SDPExchange
//
var SdpExchangeRequest = /** @class */ (function (_super) {
    __extends(SdpExchangeRequest, _super);
    function SdpExchangeRequest(toUser, sdpObject) {
        var _this = _super.call(this, MessageType.SDPExchange) || this;
        _this.toUser = toUser;
        _this.sdpObject = sdpObject;
        return _this;
    }
    return SdpExchangeRequest;
}(TypedMessage));
exports.SdpExchangeRequest = SdpExchangeRequest;
var SdpExchangeResponse = /** @class */ (function (_super) {
    __extends(SdpExchangeResponse, _super);
    function SdpExchangeResponse(fromUser, sdpObject) {
        var _this = _super.call(this, MessageType.SDPExchange) || this;
        _this.fromUser = fromUser;
        _this.sdpObject = sdpObject;
        return _this;
    }
    return SdpExchangeResponse;
}(TypedMessage));
exports.SdpExchangeResponse = SdpExchangeResponse;
