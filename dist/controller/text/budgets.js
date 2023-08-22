"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBudgetAmount = void 0;
const bot_1 = require("../../utils/bot");
const db_1 = require("../../db");
const store_1 = require("../../store");
const toEmoji = require("emoji-name-map");
const handleBudgetAmount = async (amt, chat_id, username) => {
    try {
        if (!isNaN(amt) && amt > 0) {
            const selectionStr = await store_1.default.get(`${chat_id}:budget-categories`);
            const selection = JSON.parse(selectionStr);
            const insertQuery = `
        INSERT INTO
          budgets
        (
          categories,
          amount,
          status,
          isActive,
          user,
          threshold,
          date_added,
          last_checked
        ) VALUES (
          ?,
          0.00,
          "ok",
          1,
          ?,
          ?,
          CURRENT_TIMESTAMP(),
          CURRENT_TIMESTAMP()
        );
        `;
            await db_1.default.promise().query({
                sql: insertQuery,
                values: [
                    selection
                        .filter((c) => c.selected)
                        .map((c) => c.slug)
                        .join(","),
                    username,
                    amt,
                ],
            });
            (0, bot_1.sendMessage)(chat_id, "Budget set successfully 💛\nYou'll receive notifications if you start reaching your threshold limit.");
        }
        else {
            (0, bot_1.sendMessage)(chat_id, "Please enter a valid amount 😅");
        }
    }
    catch (error) {
        console.error(error);
    }
};
exports.handleBudgetAmount = handleBudgetAmount;
