import { sendMessage, answerQuery } from "../../utils/bot";
import store from "../../store";
import { CallbackQueryT } from "../../../index";

import {
  handleCategories,
  handleCategoryType,
  handleShouldAddEmoji,
} from "./categories";
import { handleCategory } from "./record";
import { handleStats } from "./stats";
import { handleBudgets, handleBudgetCategories } from "./budgets";

const processQuery: (
  callback_query_id: string,
  callback_data: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (
  callback_query_id,
  callback_data,
  callback_query
) => {
  const [chat_id, type, data] = callback_data.split(":");
  try {
    const command = await store.get(`${chat_id}:command`);
    const next = await store.get(`${chat_id}:next`);
    console.log({ data, command, next });

    switch (command) {
      case "/earning":
      case "/expend": {
        handleCategory(data, callback_query);
        answerQuery(callback_query_id);
        break;
      }
      case "/stats": {
        handleStats(data, callback_query);
        answerQuery(callback_query_id);
        break;
      }
      case "/categories": {
        switch (next) {
          case "view/add": {
            handleCategories(data, callback_query);
            answerQuery(callback_query_id);
            break;
          }
          case "add-emoji?": {
            handleShouldAddEmoji(data, callback_query);
            answerQuery(callback_query_id);
            break;
          }
          case "cat-type": {
            handleCategoryType(data, callback_query);
            answerQuery(callback_query_id);
            break;
          }
          default: {
            sendMessage(
              chat_id,
              "Seems like you entered an invalid text or option 😵"
            );
            break;
          }
        }

        break;
      }
      case "/budgets": {
        switch (next) {
          case "view/set": {
            handleBudgets(data, callback_query);
            answerQuery(callback_query_id);
            break;
          }
          case "budget-categories": {
            handleBudgetCategories(data, callback_query);
            answerQuery(callback_query_id);
            break;
          }
        }
        break;
      }
      default: {
        sendMessage(
          chat_id,
          "Seems like you entered an invalid text or option 😵"
        );
        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

export default processQuery;
