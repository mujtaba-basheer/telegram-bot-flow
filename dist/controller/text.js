"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processText = void 0;
const bot_1 = require("../utils/bot");
const db_1 = require("../db");
const store_1 = require("../store");
const toEmoji = require("emoji-name-map");
const handleNumber = async (amt, chat_id, command) => {
    try {
        await store_1.default.set(`${chat_id}:amount`, amt);
        const [results] = await db_1.default.promise().query(`SELECT
        name, slug, emoji
       FROM
        categories
       WHERE
        type = "${command.replace("/", "")}";
      `);
        const categories = results;
        const buttons = [], row = [];
        for (const category of categories) {
            const { name, slug } = category;
            if (row.length === 2) {
                buttons.push([...row]);
                row.pop();
                row.pop();
                row.push({
                    text: name,
                    callback_data: slug,
                });
            }
            else {
                row.push({
                    text: name,
                    callback_data: slug,
                });
            }
        }
        const reply_markup = {
            inline_keyboard: categories.map((c) => [
                {
                    text: c.name + " " + toEmoji.get(c.emoji),
                    callback_data: `${chat_id}:category:${c.slug}`,
                },
            ]),
        };
        (0, bot_1.sendMessageKeyboard)(chat_id, command === "/earning"
            ? "Awesome 🤑\nWhat was the source of this earning?"
            : "Sure. Under which category should this expenditure be placed?", reply_markup);
    }
    catch (error) {
        console.error(error);
    }
};
const processText = async (text, update) => {
    const { message: { chat: { id: chat_id }, }, } = update;
    try {
        const command = await store_1.default.get(`${chat_id}:command`);
        switch (command) {
            case "/earning":
            case "/expend": {
                const next = await store_1.default.get(`${chat_id}:next`);
                switch (next) {
                    case "amount": {
                        if (isNaN(+text)) {
                            if (text.toLowerCase().includes("rs")) {
                                (0, bot_1.sendMessage)(chat_id, "Please enter amount without currency code or symbol 😅");
                            }
                            else
                                (0, bot_1.sendMessage)(chat_id, "Please enter a valid number 😅");
                        }
                        else {
                            await store_1.default.set(`${chat_id}:next`, "category");
                            handleNumber(+text, chat_id, command);
                        }
                        break;
                    }
                    case "category": {
                        (0, bot_1.sendMessage)(chat_id, "Please select a category from the inline keyboard.");
                        break;
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    catch (error) {
        if (error.errno === 1062) {
            (0, bot_1.sendMessage)(chat_id, "Your account has already been registered with us!");
        }
    }
};
exports.processText = processText;
exports.default = exports.processText;
