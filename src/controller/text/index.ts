import { sendMessage } from "../../utils/bot";
import { UpdateT } from "../../../index.d";
import store from "../../store";

import { handleCategoryEmoji, handleCategoryName } from "./categories";
import { handleNumber as handleTransactionAmt } from "./record";
import {
  handleSavingsName,
  handleNumber as handleGoalTargetAmt,
  handleNumberOfWeeks,
} from "./savings";
import { handleBudgetAmount } from "./budgets";

export const processText: (
  text: string,
  update: UpdateT
) => Promise<void> = async (text, update) => {
  const {
    message: {
      chat: { id: chat_id, username },
    },
  } = update;
  try {
    const command = await store.get(`${chat_id}:command`);
    const next = await store.get(`${chat_id}:next`);
    text = text.trim();

    switch (command) {
      case "/earning":
      case "/expend": {
        switch (next) {
          case "amount": {
            if (isNaN(+text)) {
              if (text.toLowerCase().includes("rs")) {
                sendMessage(
                  chat_id,
                  "Please enter amount without currency code or symbol 😅"
                );
              } else sendMessage(chat_id, "Please enter a valid number 😅");
            } else {
              await store.set(`${chat_id}:next`, "category");
              handleTransactionAmt(+text, chat_id, username, command);
            }
            break;
          }
          case "category": {
            sendMessage(
              chat_id,
              "Please select a category from the inline keyboard."
            );
            break;
          }
        }
        break;
      }
      case "/categories": {
        switch (next) {
          case "cat-name": {
            if (text.includes("\n")) {
              sendMessage(
                chat_id,
                "Please do not inlcude line breaks in category name 😅"
              );
            } else {
              await store.set(`${chat_id}:next`, "cat-emoji");
              handleCategoryName(text, chat_id, command);
            }
            break;
          }
          case "add-emoji": {
            handleCategoryEmoji(text, chat_id, command);
            break;
          }
        }
        break;
      }
      case "/budgets": {
        switch (next) {
          case "budget-amount": {
            handleBudgetAmount(+text, chat_id, username);
            break;
          }
        }
        break;
      }
      case "/savings": {
        switch (next) {
          case "goal-name": {
            handleSavingsName(text, chat_id);
            break;
          }
          case "goal-amount": {
            handleGoalTargetAmt(text, chat_id);
            break;
          }
          case "goal-duration": {
            handleNumberOfWeeks(text, chat_id, username);
            break;
          }
        }
        break;
      }
      default: {
        sendMessage(chat_id, "Invalid command or option 😅");
        break;
      }
    }
  } catch (error) {
    if (error.errno === 1062) {
      sendMessage(chat_id, "Your account has already been registered with us!");
    }
  }
};

export default processText;
