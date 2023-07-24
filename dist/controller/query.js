"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("../store");
const db_1 = require("../db");
const bot_1 = require("../utils/bot");
const toEmoji = require("emoji-name-map");
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
                (0, bot_1.sendMessage)(chat_id, `Your transaction was recorded successfully!\nType: ${command === "/earning" ? "Earning" : "Expenditure"}\nAmount: <b>${(0, bot_1.formatCurrency)(+amount)}</b>\nCategory: ${name} ${emoji ? toEmoji.get(emoji) : ""}`, "HTML");
                console.log({ username, category });
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
                        message += `Category: ${cname} ${cemoji ? toEmoji.get(cemoji) : ""}\n\n`;
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
                        const catDisplay = `${cname} ${cemoji ? toEmoji.get(cemoji) : ""}`;
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
// when a user wishes to view/add categories
const handleCategories = async (action, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        switch (action) {
            case "view": {
                const selectQuery = `
        SELECT
          name, slug, emoji, scope, type
        FROM
          categories
        WHERE
          user = "global"
          OR user = ?;
        `;
                // @ts-ignore
                const [results] = await db_1.default.promise().query({
                    sql: selectQuery,
                    values: [username],
                });
                let message = "<b>Global Categories:</b>\n";
                const globalCategories = [];
                const customCategories = [];
                results.forEach((c) => {
                    if (c.scope === "global")
                        globalCategories.push(c);
                    else if (c.scope === "custom")
                        customCategories.push(c);
                });
                globalCategories.forEach((c, i, arr) => {
                    const { name, emoji, type } = c;
                    message += `${name} ${emoji ? toEmoji.get(emoji) : ""} (${type})`;
                    if (i !== arr.length - 1)
                        message += "\n";
                });
                if (customCategories.length) {
                    message += "\n\n<b>Custom Categories:</b>\n";
                    customCategories.forEach((c, i, arr) => {
                        const { name, emoji, type } = c;
                        message += `${name} ${emoji ? toEmoji.get(emoji) : ""} (${type})`;
                        if (i !== arr.length - 1)
                            message += "\n";
                    });
                }
                (0, bot_1.sendMessage)(chat_id, message, "HTML");
                break;
            }
            case "add": {
                await store_1.default.set(`${chat_id}:next`, "cat-name");
                (0, bot_1.sendMessage)(chat_id, "Please enter the category name");
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
// when a user selects the category type for the added category
const handleCategoryType = async (type, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        const category_name = await store_1.default.get(`${chat_id}:cat-name`);
        const slug = await store_1.default.get(`${chat_id}:cat-slug`);
        const insertQuery = `
    INSERT INTO
      categories
    (
      name,
      slug,
      type,
      user,
      emoji,
      scope
    ) VALUES (
      ?,
      ?,
      ?,
      ?,
      "",
      "custom"
    );
    `;
        await db_1.default.promise().query({
            sql: insertQuery,
            values: [category_name, slug, type, username],
        });
        let message = "Added category:\n";
        message += `<b>Name:</b> ${category_name}\n`;
        message += `<b>Type:</b> ${type === "expend" ? "Way of expenditure" : "Source of earning"}`;
        (0, bot_1.sendMessage)(chat_id, message, "HTML");
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
            case "categories": {
                handleCategories(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "cat-type": {
                handleCategoryType(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
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
exports.default = processQuery;
