"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBudgetCategories = exports.handleBudgets = void 0;
const store_1 = require("../../store");
const db_1 = require("../../db");
const bot_1 = require("../../utils/bot");
const toEmoji = require("emoji-name-map");
// when a user wishes to view/set budgets
const handleBudgets = async (action, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        switch (action) {
            case "view": {
                const selectQuery = `
        SELECT
          name, threshold, amount
        FROM
          budgets
        WHERE
          user = ?;
        `;
                // @ts-ignore
                const [results] = await db_1.default.promise().query({
                    sql: selectQuery,
                    values: [username],
                });
                let message = ``;
                for (let i = 0; i < results.length; i++) {
                    const budget = results[i];
                    const { name, threshold, amount } = budget;
                    message += `<b>${i + 1}. ${name}</b>\nThreshold: Rs. ${threshold}\nSpent: Rs. ${amount}`;
                    if (i != results.length - 1)
                        message += `\n\n`;
                }
                (0, bot_1.sendMessage)(chat_id, message, "HTML");
                break;
            }
            case "set": {
                const selectQuery = `
        SELECT
          name, slug, emoji
        FROM
          categories
        WHERE
          type = "expend"
          AND (
            user = "global"
            OR user = "${username}"
          )
        `;
                const [results] = (await db_1.default
                    .promise()
                    .query(selectQuery));
                const selection = results.map((c) => ({
                    name: c.name,
                    display: c.name + (c.emoji ? ` ${(0, bot_1.unicodeToEmoji)(c.emoji)}` : ""),
                    slug: c.slug,
                    selected: false,
                }));
                const inline_keyboard = [
                    ...selection.map((c) => [
                        {
                            text: c.display,
                            callback_data: `${chat_id}:budget-categories:${c.slug}`,
                        },
                    ]),
                    [
                        {
                            text: "Done ✅",
                            callback_data: `${chat_id}:budget-categories:done`,
                        },
                    ],
                ];
                const reply_markup = {
                    inline_keyboard,
                };
                (0, bot_1.sendMessage)(chat_id, "Please note, any budgets you set will be active from the beginning of the next month");
                (0, bot_1.sendMessageKeyboard)(chat_id, "Please select the categories to inclde in the budget", reply_markup);
                await store_1.default.set(`${chat_id}:next`, "budget-categories");
                await store_1.default.set(`${chat_id}:budget-categories`, JSON.stringify(selection));
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
exports.handleBudgets = handleBudgets;
// when a user selects categories to add in a budget
const handleBudgetCategories = async (slug, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        const selectionStr = await store_1.default.get(`${chat_id}:budget-categories`);
        const selection = JSON.parse(selectionStr);
        if (slug === "done") {
            if (selection.filter((c) => c.selected).length === 0) {
                (0, bot_1.sendMessage)(chat_id, "Please select at least one category 😕");
            }
            else {
                (0, bot_1.sendMessage)(chat_id, "Please enter the budget threshold amount (without commas or currency symbol)");
                await store_1.default.set(`${chat_id}:next`, "budget-amount");
            }
        }
        else {
            selection.forEach((c) => {
                if (c.slug === slug)
                    c.selected = !c.selected;
            });
            const inline_keyboard = [
                ...selection.map((c) => [
                    {
                        text: `${c.selected ? "☑️ " : ""}${c.display}`,
                        callback_data: `${chat_id}:budget-categories:${c.slug}`,
                    },
                ]),
                [
                    {
                        text: "Done ✅",
                        callback_data: `${chat_id}:budget-categories:done`,
                    },
                ],
            ];
            const reply_markup = {
                inline_keyboard,
            };
            (0, bot_1.updateMessageKeyboard)(chat_id, reply_markup);
            await store_1.default.set(`${chat_id}:budget-categories`, JSON.stringify(selection));
        }
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
exports.handleBudgetCategories = handleBudgetCategories;
