"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processText = void 0;
const bot_1 = require("../utils/bot");
const db_1 = require("../db");
const store_1 = require("../store");
const toEmoji = require("emoji-name-map");
const handleNumber = async (amt, chat_id, username, command) => {
    try {
        await store_1.default.set(`${chat_id}:amount`, amt);
        const [results] = await db_1.default.promise().query(`SELECT
        name, slug, emoji
       FROM
        categories
       WHERE
        type = "${command.replace("/", "")}"
        AND (
          user = "global"
          OR user = "${username}"
        );
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
                    text: c.name + (c.emoji ? " " + toEmoji.get(c.emoji) : ""),
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
// when a user enters the name of the category he/she wants to add
const handleCategoryName = async (name, chat_id, command) => {
    try {
        {
            console.log(name, name.split(" "));
            (0, bot_1.sendMessage)(chat_id, "Yo");
            return;
        }
        const slug = (0, bot_1.slugify)(name, chat_id);
        await store_1.default.set(`${chat_id}:cat-name`, name);
        await store_1.default.set(`${chat_id}:cat-slug`, slug);
        const inline_keyboard = [
            [
                {
                    text: "Way of expenditure",
                    callback_data: `${chat_id}:cat-type:expend`,
                },
                {
                    text: "Source of earning",
                    callback_data: `${chat_id}:cat-type:earning`,
                },
            ],
        ];
        const reply_markup = {
            inline_keyboard,
        };
        (0, bot_1.sendMessageKeyboard)(chat_id, "Please select the category type from the inline keyboard.", reply_markup);
    }
    catch (error) {
        console.error(error);
    }
};
const processText = async (text, update) => {
    const { message: { chat: { id: chat_id, username }, }, } = update;
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
                            handleNumber(+text, chat_id, username, command);
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
            case "/categories": {
                const next = await store_1.default.get(`${chat_id}:next`);
                switch (next) {
                    case "cat-name": {
                        if (text.includes("\n")) {
                            (0, bot_1.sendMessage)(chat_id, "Please do not inlcude line breaks in category name 😅");
                        }
                        else
                            handleCategoryName(text, chat_id, command);
                        break;
                    }
                }
                break;
            }
            default: {
                (0, bot_1.sendMessage)(chat_id, "Invalid command or option 😅");
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
