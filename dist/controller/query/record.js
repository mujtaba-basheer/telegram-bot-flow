"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCategory = void 0;
const store_1 = require("../../store");
const db_1 = require("../../db");
const bot_1 = require("../../utils/bot");
const budgets_1 = require("../../utils/budgets");
// when a user selects the category for an expediture/earning
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
                (0, bot_1.sendMessage)(chat_id, `Your transaction was recorded successfully!\nType: ${command === "/earning" ? "Earning" : "Expenditure"}\nAmount: <b>${(0, bot_1.formatCurrency)(+amount)}</b>\nCategory: ${name} ${emoji ? (0, bot_1.unicodeToEmoji)(emoji) : ""}`, "HTML");
                const insertQuery = `
        INSERT INTO transactions
        (
          amount,
          timestamp,
          type,
          category,
          user
        )
        VALUES (
          ?,
          NOW(),
          ?,
          ?,
          ?
        );
        `;
                await db_1.default.promise().query({
                    sql: insertQuery,
                    values: [amount, command.replace("/", ""), category, username],
                });
                (0, budgets_1.checkBudgetOnTransaction)(chat_id, username, category, +amount);
                break;
            }
            default: {
                (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
exports.handleCategory = handleCategory;
