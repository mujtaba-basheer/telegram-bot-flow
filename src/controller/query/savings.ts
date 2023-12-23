import store from "../../store";
import db from "../../db";
import { CallbackQueryT } from "../../..";
import { sendMessage } from "../../utils/bot";
import { SavingsT } from "../../..";
import { currencyFormatter } from "../../utils/format";

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
        const selectQuery = `
        SELECT
          name, duration, amount, status, isActive, date_added
        FROM
          savings
        WHERE
          user = ?;
        `;
        // @ts-ignore
        const [results] = await db.promise().query<SavingsT[]>({
          sql: selectQuery,
          values: [username],
        });
        let message = "<b>Saving Goals:</b>";
        results.forEach((savingGoal, index) => {
          const { name, duration, date_added, amount } = savingGoal;
          let itemStr = "\n\n" + `${index + 1}. `;
          itemStr += `<b><i>${name}</i></b>\n`;
          itemStr += `<b>Target:</b> ${currencyFormatter.format(amount)}\n`;
          itemStr += `<b>Duration:</b> ${duration} month${
            duration > 1 ? "s" : ""
          }\n`;
          itemStr += `<b>Added on:</b> ${date_added.toLocaleDateString()}`;
          message += itemStr;
        });
        sendMessage(chat_id, message, "HTML");

        await store.set(`${chat_id}:next`, "");

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
