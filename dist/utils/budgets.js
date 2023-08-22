"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBudgetOnTransaction = void 0;
const db_1 = require("../db");
const bot_1 = require("./bot");
const checkBudgetOnInit = async (username, categories) => {
    try {
        const selectQuery = `
    SELECT FROM
      budgets
    WHERE
      user = ?
      AND categories = ?
    ORDER BY
      date_added DESC
    LIMIT
      1;
    `;
        const [results] = (await db_1.default.promise().query({
            sql: selectQuery,
            values: [username, categories],
        }));
        const budget = results[0];
    }
    catch (error) { }
};
const checkBudgetOnTransaction = async (chat_id, username, category, amount) => {
    try {
        const updateQuery = `
      UPDATE
        budgets
      SET
        amount = IF(MONTH(last_checked) = MONTH(CURRENT_DATE()), amount + ?, ?),
        last_checked = CURRENT_TIMESTAMP()
      WHERE
        user = ?
        AND LOCATE(?, categories) != 0;
      `;
        await db_1.default.promise().query({
            sql: updateQuery,
            values: [amount, amount, username, category],
        });
        const selectQuery = `
      SELECT
        *
      FROM
        budgets
      WHERE
        user = ?
        AND LOCATE(?, categories) != 0;
      `;
        const [budgets] = (await db_1.default.promise().query({
            sql: selectQuery,
            values: [username, category],
        }));
        for (const budget of budgets) {
            const { amount, threshold } = budget;
            const percent = (amount / threshold) * 100;
            let message = "";
            if (percent > 100) {
                message = `You have crossed the budget limit!`;
            }
            else if (percent === 100) {
                message = "You have reached the budget limit!";
            }
            else if (percent > 95) {
                message = "You have crossed 95% of the budget limit!";
            }
            else if (percent === 95) {
                message = "You have reached 95% of the budget limit!";
            }
            else if (percent > 90) {
                message = "You have crossed 90% of the budget limit!";
            }
            else if (percent === 90) {
                message = "You have reached 90% of the budget limit!";
            }
            else if (percent > 75) {
                message = "You have crossed 75% of the budget limit!";
            }
            else if (percent === 75) {
                message = "You have reached 75% of the budget limit!";
            }
            else if (percent > 50) {
                message = "You have crossed 50% of the budget limit!";
            }
            else if (percent === 50) {
                message = "You have reached 50% of the budget limit!";
            }
            if (message) {
                (0, bot_1.sendMessage)(chat_id, message);
            }
        }
    }
    catch (error) {
        console.error(error);
    }
};
exports.checkBudgetOnTransaction = checkBudgetOnTransaction;
