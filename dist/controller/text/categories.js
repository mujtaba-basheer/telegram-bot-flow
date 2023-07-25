"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCategoryEmoji = exports.handleCategoryName = void 0;
const bot_1 = require("../../utils/bot");
const store_1 = require("../../store");
const toEmoji = require("emoji-name-map");
// when a user enters the name of the category he/she wants to add
const handleCategoryName = async (name, chat_id, command) => {
    try {
        const slug = (0, bot_1.slugify)(name, chat_id);
        await store_1.default.set(`${chat_id}:cat-name`, name);
        await store_1.default.set(`${chat_id}:cat-slug`, slug);
        await store_1.default.set(`${chat_id}:next`, "add-emoji?");
        const inline_keyboard = [
            [
                {
                    text: "Yes 😃",
                    callback_data: `${chat_id}:add-emoji?:yes`,
                },
                {
                    text: "No 🚫",
                    callback_data: `${chat_id}:add-emoji?:no`,
                },
            ],
        ];
        const reply_markup = {
            inline_keyboard,
        };
        (0, bot_1.sendMessageKeyboard)(chat_id, "Please select if you wish to add an emoji for this category", reply_markup);
    }
    catch (error) {
        console.error(error);
    }
};
exports.handleCategoryName = handleCategoryName;
// when a user enters an emoji for the added category
const handleCategoryEmoji = async (code, chat_id, command) => {
    try {
        code = code.trim().toLowerCase();
        console.log({ code });
        let emojiCode = "";
        console.log(toEmoji.get(code));
        for (const key of Object.keys(toEmoji.emoji)) {
            if (key === code) {
                emojiCode = code;
                break;
            }
        }
        if (emojiCode === "") {
            (0, bot_1.sendMessage)(chat_id, "Sorry but we couldn't find this emoji-code in out records 😞\nPlease enter another emoji");
            return;
        }
        await store_1.default.set(`${chat_id}:cat-emoji`, emojiCode);
        await store_1.default.set(`${chat_id}:next`, "cat-type");
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
exports.handleCategoryEmoji = handleCategoryEmoji;
