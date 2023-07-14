"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../store");
const db_1 = require("../db");
const bot_1 = require("../utils/bot");
const toEmoji = require("emoji-name-map");
const handleCategory = async (category, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        const command = await store_1.default.get(`${chat_id}:command`);
        const amount = await store_1.default.get(`${chat_id}:amount`);
        switch (command) {
            case "/earning":
            case "/expend": {
                const [results] = await db_1.default.promise().query(`
        SELECT
          name, emoji, slug
        FROM
          categories
        WHERE
          slug = "${category}"
        LIMIT
          1;
        `);
                const { name, emoji } = results[0];
                (0, bot_1.sendMessage)(chat_id, `Your transaction was recorded successfully!\nType: ${command === "/earning" ? "Earning" : "Expenditure"}\nAmount: <b>${(0, bot_1.formatCurrency)(+amount)}</b>\nCategory: ${name} ${toEmoji.get(emoji)}`, "HTML");
                await db_1.default.promise().query(`
        INSERT INTO transactions
        VALUES (
          ${amount},
          NOW(),
          "${command.replace("/", "")}",
          "${category}",
          "${username}"
        );
        `);
                break;
            }
            default: {
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
const handleStats = async (stats, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        switch (stats) {
            case "recent": {
                // @ts-ignore
                const [results] = await db_1.default.promise().query(`
        SELECT
          amount, timestamp, transactions.type, categories.name AS cname, categories.emoji AS cemoji
        FROM
          transactions
        LEFT JOIN
          categories
        ON
          transactions.category = categories.slug
        WHERE
          transactions.user = "${username}"
        ORDER BY timestamp DESC
        LIMIT 10;
        `);
                let message = "Your most recent transactions:\n\n";
                if (results.length) {
                    for (let i = 0; i < results.length; i++) {
                        const { amount, timestamp, type, cname, cemoji } = results[i];
                        const d = new Date(timestamp);
                        message += `Date: ${d.toDateString()}, ${d.toLocaleTimeString()}\n`;
                        message += `Amount: <b>${(0, bot_1.formatCurrency)(amount)}</b>\n`;
                        message += `Type: ${type === "expend" ? "Expenditure" : "Earning"}\n`;
                        message += `Category: ${cname} ${toEmoji.get(cemoji)}\n\n`;
                    }
                    (0, bot_1.sendMessage)(chat_id, message, "HTML");
                }
                else {
                    (0, bot_1.sendMessage)(chat_id, "Seems like you've no recent transactions at the moment 😬", "HTML");
                }
                break;
            }
            case "stats": {
                // @ts-ignore
                const [byTypeRes] = await db_1.default.promise().query(`
        SELECT
          transactions.type, SUM(transactions.amount) AS sum
        FROM
          transactions
        WHERE
          transactions.user = "mujtaba_basheer"
        GROUP BY
          transactions.type;
        `);
                let total = byTypeRes.reduce((p, c) => (p += c.sum), 0);
                let message = `Total transactions volume: <b>${(0, bot_1.formatCurrency)(total)}</b>\n\n`;
                for (let i = 0; i < byTypeRes.length; i++) {
                    const { type, sum } = byTypeRes[i];
                    const percentage = ((sum / total) * 100).toFixed(2);
                    const typeDisplay = type === "expend" ? "Expenditure" : "Earning";
                    message += `${typeDisplay}: ${(0, bot_1.formatCurrency)(sum)} (${percentage}%)\n`;
                }
                (0, bot_1.sendMessage)(chat_id, message, "HTML");
                // @ts-ignore
                const [byCatRes] = await db_1.default.promise().query(`
        SELECT
          categories.name as cname, categories.emoji as cemoji, SUM(transactions.amount) AS sum
        FROM
          transactions
        LEFT JOIN
          categories
        ON
          transactions.category = categories.slug
        WHERE
          transactions.user = "${username}" AND transactions.type = "expend"
        GROUP BY
          transactions.category,
          categories.name,
          categories.emoji;
        `);
                total = byCatRes.reduce((p, c) => (p += c.sum), 0);
                if (byCatRes.length) {
                    message = `Expenditure breakdown:\n\n`;
                    for (let i = 0; i < byCatRes.length; i++) {
                        const { cemoji, cname, sum } = byCatRes[i];
                        const percentage = ((sum / total) * 100).toFixed(2);
                        const catDisplay = `${cname} ${toEmoji.get(cemoji)}`;
                        message += `${catDisplay}: Rs. ${sum} (${percentage}%)\n`;
                    }
                }
                else {
                    message = "There are no recorded expenditures at the moment 🧐";
                }
                (0, bot_1.sendMessage)(chat_id, message, "HTML");
                break;
            }
            default: {
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
const processQuery = async (callback_query_id, callback_data, callback_query) => {
    const [chat_id, type, data] = callback_data.split(":");
    try {
        switch (type) {
            case "category": {
                handleCategory(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "stats": {
                handleStats(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            default: {
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
exports.default = processQuery;
