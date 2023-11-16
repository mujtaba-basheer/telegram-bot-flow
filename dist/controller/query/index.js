"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../../utils/bot");
const store_1 = require("../../store");
const categories_1 = require("./categories");
const record_1 = require("./record");
const stats_1 = require("./stats");
const budgets_1 = require("./budgets");
const processQuery = async (callback_query_id, callback_data, callback_query) => {
    const [chat_id, type, data] = callback_data.split(":");
    try {
        const command = await store_1.default.get(`${chat_id}:command`);
        const next = await store_1.default.get(`${chat_id}:next`);
        switch (command) {
            case "/earning":
            case "/expend": {
                (0, record_1.handleCategory)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "/stats": {
                (0, stats_1.handleStats)(data, callback_query);
                (0, bot_1.answerQuery)(callback_query_id);
                break;
            }
            case "/categories": {
                switch (next) {
                    case "view/add": {
                        (0, categories_1.handleCategories)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    case "add-emoji?": {
                        (0, categories_1.handleShouldAddEmoji)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    case "cat-type": {
                        (0, categories_1.handleCategoryType)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    case "set-is-recurring": {
                        (0, categories_1.handleIsRecurring)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    case "set-is-utils": {
                        (0, categories_1.handleIsUtils)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    default: {
                        (0, bot_1.sendMessage)(chat_id, "Seems like you entered an invalid text or option 😵");
                        break;
                    }
                }
                break;
            }
            case "/budgets": {
                switch (next) {
                    case "view/set": {
                        (0, budgets_1.handleBudgets)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                    case "budget-categories": {
                        (0, budgets_1.handleBudgetCategories)(data, callback_query);
                        (0, bot_1.answerQuery)(callback_query_id);
                        break;
                    }
                }
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
