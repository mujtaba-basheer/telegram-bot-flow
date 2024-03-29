import store from "../../store";
import db from "../../db";
import { sendMessage, unicodeToEmoji, formatCurrency } from "../../utils/bot";
import { checkBudgetOnTransaction } from "../../utils/budgets";
import { CallbackQueryT, CategoryT } from "../../../index";

// when a user selects the category for an expediture/earning
export const handleCategory: (
  category: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (category, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    const command = await store.get(`${chat_id}:command`);
    const amount = await store.get(`${chat_id}:amount`);
    switch (command) {
      case "/earning":
      case "/expend": {
        const [results] = await db.promise().query(`
        SELECT
          name, emoji, slug
        FROM
          categories
        WHERE
          slug = "${category}"
        LIMIT
          1;
        `);
        const { name, emoji } = results[0] as CategoryT;
        sendMessage(
          chat_id,
          `Your transaction was recorded successfully!\nType: ${
            command === "/earning" ? "Earning" : "Expenditure"
          }\nAmount: <b>${formatCurrency(+amount)}</b>\nCategory: ${name} ${
            emoji ? unicodeToEmoji(emoji) : ""
          }`,
          "HTML"
        );

        const insertQuery = `
        INSERT INTO transactions
        (
          amount,
          timestamp,
          type,
          category,
          user
        )
        VALUES (
          ?,
          NOW(),
          ?,
          ?,
          ?
        );
        `;
        await db.promise().query({
          sql: insertQuery,
          values: [amount, command.replace("/", ""), category, username],
        });
        checkBudgetOnTransaction(chat_id, username, category, +amount);
        break;
      }
      default: {
        sendMessage(
          chat_id,
          "Oops! There was some error processing your data 😵‍💫"
        );
        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};
