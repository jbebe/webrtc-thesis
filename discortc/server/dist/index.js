"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socketServer_1 = require("./socketServer");
var app = new socketServer_1.ChatServer().getApp();
exports.app = app;
