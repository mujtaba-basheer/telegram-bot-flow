"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageReceived = void 0;
const app_error_1 = require("../utils/app-error");
const process_1 = require("../controller/process");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const messageReceived = async (req, res, next) => {
    try {
        const update = req.body;
        await (0, process_1.default)(update, res, next);
    }
    catch (error) {
        throw new app_error_1.default(error.message, 500);
    }
};
exports.messageReceived = messageReceived;
