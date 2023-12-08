"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSavings = void 0;
const store_1 = require("../../store");
const bot_1 = require("../../utils/bot");
// when a user wishes to view/add saving goals
const handleSavings = async (action, callback_query) => {
    const { from: { username }, message: { chat: { id: chat_id }, }, } = callback_query;
    try {
        switch (action) {
            case "view-goals": {
                break;
            }
            case "set-goal": {
                await store_1.default.set(`${chat_id}:next`, "goal-name");
                (0, bot_1.sendMessage)(chat_id, "What are you saving for?");
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
exports.handleSavings = handleSavings;
