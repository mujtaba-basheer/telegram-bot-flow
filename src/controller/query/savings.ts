import store from "../../store";
import { CallbackQueryT } from "../../..";
import { sendMessage } from "../../utils/bot";

// when a user wishes to view/add saving goals
export const handleSavings: (
  action: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (action, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    switch (action) {
      case "view-goals": {
        break;
      }
      case "set-goal": {
        await store.set(`${chat_id}:next`, "goal-name");
        sendMessage(chat_id, "What are you saving for?");
        break;
      }
      default: {
        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};
