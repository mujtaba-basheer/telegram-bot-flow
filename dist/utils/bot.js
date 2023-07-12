"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = exports.answerQuery = exports.sendMessageKeyboard = exports.sendMessage = void 0;
const dotenv_1 = require("dotenv");
const https = require("https");
(0, dotenv_1.config)();
const sendMessage = (chat_id, text, parse_mode) => {
    const data = JSON.stringify({
        chat_id,
        text,
        parse_mode: parse_mode,
    });
    const request = https.request({
        hostname: "api.telegram.org",
        path: `/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
        },
    }, (res) => {
        let data = "";
        res.on("error", (err) => console.error(err));
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", () => {
            if (res.statusCode === 200)
                console.log("Message sent successfully!");
            else
                console.log("Error Sending Message!");
        });
    });
    request.write(data);
    // request.write(up.toString());
    request.end();
};
exports.sendMessage = sendMessage;
const sendMessageKeyboard = (chat_id, text, reply_markup) => {
    const data = JSON.stringify({
        chat_id,
        text,
        reply_markup,
    });
    const request = https.request({
        hostname: "api.telegram.org",
        path: `/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
        },
    }, (res) => {
        let data = "";
        res.on("error", (err) => console.error(err));
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", () => {
            if (res.statusCode === 200)
                console.log("Message sent successfully!");
            else {
                console.log("Error Sending Message!");
                console.log(data);
            }
        });
    });
    request.write(data);
    // request.write(up.toString());
    request.end();
};
exports.sendMessageKeyboard = sendMessageKeyboard;
const answerQuery = (callback_query_id, text, show_alert) => {
    const data = JSON.stringify({
        callback_query_id,
        text,
        show_alert,
    });
    const request = https.request({
        hostname: "api.telegram.org",
        path: `/bot${process.env.TELEGRAM_API_TOKEN}/answerCallbackQuery`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
        },
    }, (res) => {
        let data = "";
        res.on("error", (err) => console.error(err));
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", () => {
            if (res.statusCode === 200)
                console.log("Query answered successfully!");
            else
                console.log("Error Answering Query!");
        });
    });
    request.write(data);
    // request.write(up.toString());
    request.end();
};
exports.answerQuery = answerQuery;
const formatCurrency = (amt) => {
    const f = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        currencyDisplay: "symbol",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });
    return f.format(amt);
};
exports.formatCurrency = formatCurrency;
