"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_1 = require("../apis/webhook");
const webhookRouter = (0, express_1.Router)();
// message received
webhookRouter.post("/message-received", webhook_1.messageReceived);
exports.default = webhookRouter;
