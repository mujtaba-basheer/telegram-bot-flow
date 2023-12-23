"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSavings = void 0;
const store_1 = require("../../store");
const db_1 = require("../../db");
const bot_1 = require("../../utils/bot");
const format_1 = require("../../utils/format");
// when a user wishes to view/add saving goals
const handleSavings = async (action, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        switch (action) {
            case "view-goals": {
                const selectQuery = `
        SELECT
          name, duration, amount, status, isActive, date_added
        FROM
          savings
        WHERE
          user = ?;
        `;
                // @ts-ignore
                const [results] = await db_1.default.promise().query({
                    sql: selectQuery,
                    values: [username],
                });
                let message = "<b>Saving Goals:</b>";
                results.forEach((savingGoal, index) => {
                    const { name, duration, date_added, amount } = savingGoal;
                    let itemStr = "\n\n" + `${index + 1}. `;
                    itemStr += `<b><i>${name}</i></b>\n`;
                    itemStr += `<b>Target:</b> ${format_1.currencyFormatter.format(amount)}\n`;
                    itemStr += `<b>Duration:</b> ${duration} month${duration > 1 ? "s" : ""}\n`;
                    itemStr += `<b>Added on:</b> ${date_added.toLocaleDateString()}`;
                    message += itemStr;
                });
                (0, bot_1.sendMessage)(chat_id, message, "HTML");
                await store_1.default.set(`${chat_id}:next`, "");
                break;
            }
            case "set-goal": {
                await store_1.default.set(`${chat_id}:next`, "goal-name");
                (0, bot_1.sendMessage)(chat_id, "What are you saving for?");
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
exports.handleSavings = handleSavings;
