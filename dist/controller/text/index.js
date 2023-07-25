"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processText = void 0;
const bot_1 = require("../../utils/bot");
const store_1 = require("../../store");
const categories_1 = require("./categories");
const record_1 = require("./record");
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
                            (0, record_1.handleNumber)(+text, chat_id, username, command);
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
                        else {
                            await store_1.default.set(`${chat_id}:next`, "cat-emoji");
                            (0, categories_1.handleCategoryName)(text, chat_id, command);
                        }
                        break;
                    }
                    case "add-emoji": {
                        (0, categories_1.handleCategoryEmoji)(text, chat_id, command);
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
