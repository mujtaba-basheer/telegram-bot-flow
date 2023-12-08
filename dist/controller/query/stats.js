"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStats = void 0;
const db_1 = require("../../db");
const bot_1 = require("../../utils/bot");
// when a user selects the kind of stats he/she wants to see
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
                        message += `Category: ${cname} ${cemoji ? (0, bot_1.unicodeToEmoji)(cemoji) : ""}\n\n`;
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
                        const catDisplay = `${cname} ${cemoji ? (0, bot_1.unicodeToEmoji)(cemoji) : ""}`;
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
exports.handleStats = handleStats;
