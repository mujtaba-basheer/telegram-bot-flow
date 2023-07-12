"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// creating redis client
const client = (0, redis_1.createClient)({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 6379,
    },
});
(async () => {
    client.on("ready", async () => {
        console.log("Redis client connected successfully");
    });
    await client.connect();
})();
client.on("error", (err) => {
    console.log("Error " + err);
});
exports.default = client;
