"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../../utils/bot");
const categories_1 = require("./categories");
const record_1 = require("./record");
const stats_1 = require("./stats");
const processQuery = async (callback_query_id, callback_data, callback_query) => {
    const [chat_id, type, data] = callback_data.split(":");
    try {
        switch (type) {
            case "category": {
                (0, record_1.handleCategory)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "stats": {
                (0, stats_1.handleStats)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "categories": {
                (0, categories_1.handleCategories)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "cat-type": {
                (0, categories_1.handleCategoryType)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "add-emoji?": {
                (0, categories_1.handleShouldAddEmoji)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            default: {
                (0, bot_1.sendMessage)(chat_id, "Seems like you entered an invalid text or option 😵");
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
