"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unicodeToEmoji = exports.slugify = exports.formatCurrency = exports.answerQuery = exports.sendPoll = exports.updateMessageKeyboard = exports.sendMessageKeyboard = exports.sendMessage = void 0;
const dotenv_1 = require("dotenv");
const store_1 = require("../store");
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
        res.on("end", async () => {
            if (res.statusCode === 200) {
                console.log("Message sent successfully!");
                const resp = JSON.parse(data);
                await store_1.default.set(`${chat_id}:message_id`, resp.result.message_id);
            }
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
const updateMessageKeyboard = async (chat_id, reply_markup) => {
    try {
        const message_id = await store_1.default.get(`${chat_id}:message_id`);
        const data = JSON.stringify({
            chat_id,
            message_id,
            reply_markup,
        });
        const request = https.request({
            hostname: "api.telegram.org",
            path: `/bot${process.env.TELEGRAM_API_TOKEN}/editMessageReplyMarkup`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
            },
        }, (res) => {
            let data = "";
            res.on("error", (err) => console.error(err));
            res.on("data", (chunk) => (data += chunk.toString()));
            res.on("end", async () => {
                if (res.statusCode === 200) {
                    console.log("Message keyboard updated successfully!");
                }
                else {
                    console.log("Error Sending Message!");
                    console.log(data);
                }
            });
        });
        request.write(data);
        // request.write(up.toString());
        request.end();
    }
    catch (error) {
        console.error(error);
    }
};
exports.updateMessageKeyboard = updateMessageKeyboard;
const sendPoll = (chat_id, question, options) => {
    const data = JSON.stringify({
        chat_id,
        question,
        options,
        allows_multiple_answers: true,
    });
    const request = https.request({
        hostname: "api.telegram.org",
        path: `/bot${process.env.TELEGRAM_API_TOKEN}/sendPoll`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
        },
    }, (res) => {
        let data = "";
        res.on("error", (err) => console.error(err));
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", async () => {
            if (res.statusCode === 200) {
                console.log("Message sent successfully!");
                const resp = JSON.parse(data);
                await store_1.default.set(`${chat_id}:message_id`, resp.result.message_id);
            }
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
exports.sendPoll = sendPoll;
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
const slugify = (categoryName, chat_id) => {
    let slug = `${categoryName
        .toLowerCase()
        .replace(/[\s\n\t]/g, "_")}-${chat_id}`;
    return slug;
};
exports.slugify = slugify;
const unicodeToEmoji = (unicode) => {
    const set = unicode.split(" ");
    const emoji = set
        .map((s) => {
        return String.fromCodePoint(parseInt(s, 16));
    })
        .join("");
    return emoji;
};
exports.unicodeToEmoji = unicodeToEmoji;
