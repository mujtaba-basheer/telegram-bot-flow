import { sendMessage, sendMessageKeyboard } from "../../utils/bot";
import db from "../../db";
import { CategoryT } from "../../../index.d";
import store from "../../store";
const toEmoji = require("emoji-name-map");

type SelectionT = {
  name: string;
  display: string;
  slug: string;
  selected: boolean;
}[];

export const handleBudgetAmount: (
  amt: number,
  chat_id: number,
  username: string
) => Promise<void> = async (amt, chat_id, username) => {
  try {
    if (!isNaN(amt) && amt > 0) {
      const selectionStr = await store.get(`${chat_id}:budget-categories`);
      const selection = JSON.parse(selectionStr) as SelectionT;

      const insertQuery = `
        INSERT INTO
          budgets
        (
          categories,
          amount,
          status,
          isActive,
          user,
          threshold
        ) VALUES (
          ?,
          0.00,
          "ok",
          1,
          ?,
          ?
        );
        `;
      await db.promise().query({
        sql: insertQuery,
        values: [
          selection
            .filter((c) => c.selected)
            .map((c) => c.slug)
            .join(","),
          username,
          amt,
        ],
      });
      sendMessage(
        chat_id,
        "Budget set successfully 💛\nYou'll receive notifications if you start reaching your threshold limit."
      );
    } else {
      sendMessage(chat_id, "Please enter a valid amount 😅");
    }
  } catch (error) {
    console.error(error);
  }
};
