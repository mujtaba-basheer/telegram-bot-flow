"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNumberOfWeeks = exports.handleNumber = exports.handleSavingsName = void 0;
const bot_1 = require("../../utils/bot");
const store_1 = require("../../store");
const db_1 = require("../../db");
// when a user enters the name of the saving goal
const handleSavingsName = async (name, chat_id) => {
    try {
        await store_1.default.set(`${chat_id}:goal-name`, name);
        await store_1.default.set(`${chat_id}:next`, "goal-amount");
        (0, bot_1.sendMessage)(chat_id, "Please enter your target amount");
    }
    catch (error) {
        console.error(error);
    }
};
exports.handleSavingsName = handleSavingsName;
// When a user enters the target amount for saving
const handleNumber = async (text, chat_id) => {
    try {
        if (isNaN(+text)) {
            const textToLower = text.toLowerCase();
            if (textToLower.includes("rs") ||
                textToLower.includes("₹") ||
                textToLower.includes(",")) {
                (0, bot_1.sendMessage)(chat_id, "Please enter amount without currency code, symbol or commas 😅");
            }
            else
                (0, bot_1.sendMessage)(chat_id, "Please enter a valid number 😅");
            return;
        }
        await store_1.default.set(`${chat_id}:amount`, +text);
        await store_1.default.set(`${chat_id}:next`, "goal-duration");
        (0, bot_1.sendMessage)(chat_id, "Sure 👍. When do wish to achieve your saving goal?\nPlease mention number of months from now");
    }
    catch (error) {
        console.error(error);
    }
};
exports.handleNumber = handleNumber;
// When a user enters the saving goal duration in weeks
const handleNumberOfWeeks = async (text, chat_id, username) => {
    try {
        if (isNaN(+text) || text.includes(".") || +text < 1) {
            (0, bot_1.sendMessage)(chat_id, "Please enter a valid whole number 😅");
            return;
        }
        const goalName = await store_1.default.get(`${chat_id}:goal-name`);
        const targetAmount = await store_1.default.get(`${chat_id}:amount`);
        const insertQuery = `
    INSERT INTO
      savings (name, user, duration, amount)
    VALUES
      (?, ?, ?, ?);
    `;
        await db_1.default.promise().query({
            sql: insertQuery,
            values: [goalName, username, +text, +targetAmount],
        });
        (0, bot_1.sendMessage)(chat_id, "Savings goal added successfully 💯");
        await store_1.default.del(`${chat_id}:goal-name`);
        await store_1.default.del(`${chat_id}:amount`);
        await store_1.default.set(`${chat_id}:next`, "");
    }
    catch (error) {
        console.error(error);
    }
};
exports.handleNumberOfWeeks = handleNumberOfWeeks;
