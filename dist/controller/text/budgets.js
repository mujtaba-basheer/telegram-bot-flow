"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBudgetAmount = void 0;
const bot_1 = require("../../utils/bot");
const db_1 = require("../../db");
const store_1 = require("../../store");
// when the user enters an amount for the budget threshold
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
          name,
          amount,
          status,
          isActive,
          user,
          threshold,
          date_added,
          last_checked
        ) VALUES (
          ?,
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
            const selectedCategories = selection.filter((c) => c.selected);
            const budgetName = selectedCategories.map((c) => c.name).join(", ");
            await db_1.default.promise().query({
                sql: insertQuery,
                values: [
                    selectedCategories.map((c) => c.slug).join(","),
                    budgetName,
                    username,
                    amt,
                ],
            });
            (0, bot_1.sendMessage)(chat_id, `Budget set successfully for <b>${budgetName}</b>\nYou'll receive notifications if you start reaching your threshold limit.`, "HTML");
            const getTotalQuery = `
      SELECT
        SUM(threshold) as total
      FROM
        budgets
      WHERE
        user = ?;
      `;
            const [[{ total }]] = (await db_1.default.promise().query({
                sql: getTotalQuery,
                values: [username],
            }));
            (0, bot_1.sendMessage)(chat_id, `Total monthly budget so far: <b>Rs. ${total}</b>.`, "HTML");
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
