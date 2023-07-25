"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNumber = void 0;
const bot_1 = require("../../utils/bot");
const db_1 = require("../../db");
const store_1 = require("../../store");
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
exports.handleNumber = handleNumber;
