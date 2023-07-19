"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCommand = void 0;
const bot_1 = require("../utils/bot");
const db_1 = require("../db");
const store_1 = require("../store");
const handleStart = async (first_name, last_name, username, chat_id) => {
    try {
        await db_1.default.promise().query(`
    INSERT INTO
      users
    VALUES
    (
      "${first_name}",
      "${last_name}",
      "${username}",
      NULL,
      NOW()
    );
    `);
        (0, bot_1.sendMessage)(chat_id, "Your account has been registered successfully!");
    }
    catch (error) {
        if (error.errno === 1062) {
            (0, bot_1.sendMessage)(chat_id, "Your account has already been registered with us!");
        }
    }
};
const handleRecord = async (type, chat_id) => {
    try {
        await store_1.default.set(`${chat_id}:next`, "amount");
        (0, bot_1.sendMessage)(chat_id, "Please enter the amount");
    }
    catch (error) {
        if (error.errno === 1062) {
            (0, bot_1.sendMessage)(chat_id, "Your account has already been registered with us!");
        }
    }
};
const handleStats = async (chat_id) => {
    try {
        await store_1.default.set(`${chat_id}:next`, "type");
        const buttons = [
            [
                {
                    text: "Recent Transactions 💸",
                    callback_data: `${chat_id}:stats:recent`,
                },
            ],
            [
                {
                    text: "Enlighten Me 📊",
                    callback_data: `${chat_id}:stats:stats`,
                },
            ],
        ];
        const reply_markup = {
            inline_keyboard: buttons,
        };
        (0, bot_1.sendMessageKeyboard)(chat_id, "Please select an option:", reply_markup);
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
const handleCategories = async (chat_id) => {
    try {
        await store_1.default.set(`${chat_id}:next`, "view/add category");
        const buttons = [
            [
                {
                    text: "View categories 🧐",
                    callback_data: `${chat_id}:categories:view`,
                },
            ],
            [
                {
                    text: "Add a category ➕",
                    callback_data: `${chat_id}:categories:add`,
                },
            ],
        ];
        const reply_markup = {
            inline_keyboard: buttons,
        };
        (0, bot_1.sendMessageKeyboard)(chat_id, "Please select an option:", reply_markup);
    }
    catch (error) {
        console.error(error);
        (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
    }
};
const processCommand = async (command, update) => {
    const { message: { from: { first_name, last_name, username }, chat: { id: chat_id }, }, } = update;
    try {
        await store_1.default.set(`${chat_id}:command`, command);
        switch (command) {
            case "/start": {
                await handleStart(first_name, last_name, username, chat_id);
                break;
            }
            case "/earning": {
                await handleRecord("earning", chat_id);
                break;
            }
            case "/expend": {
                await handleRecord("expenditure", chat_id);
                break;
            }
            case "/stats": {
                await handleStats(chat_id);
                break;
            }
            case "/categories": {
                await handleCategories(chat_id);
                break;
            }
            default: {
                (0, bot_1.sendMessage)(chat_id, "Oops! There was some error processing your data 😵‍💫");
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
exports.processCommand = processCommand;
exports.default = exports.processCommand;
