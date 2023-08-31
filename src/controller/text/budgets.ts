import { sendMessage } from "../../utils/bot";
import db from "../../db";
import store from "../../store";

type SelectionT = {
  name: string;
  display: string;
  slug: string;
  selected: boolean;
}[];
type SumAggrT = [
  {
    total: number;
  }
];

// when the user enters an amount for the budget threshold
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
          name,
          amount,
          status,
          isActive,
          user,
          threshold,
          date_added,
          last_checked
        ) VALUES (
          ?,
          ?,
          0.00,
          "ok",
          1,
          ?,
          ?,
          CURRENT_TIMESTAMP(),
          CURRENT_TIMESTAMP()
        );
        `;
      const selectedCategories = selection.filter((c) => c.selected);
      const budgetName = selectedCategories.map((c) => c.name).join(", ");
      await db.promise().query({
        sql: insertQuery,
        values: [
          selectedCategories.map((c) => c.slug).join(","),
          budgetName,
          username,
          amt,
        ],
      });
      sendMessage(
        chat_id,
        `Budget set successfully for <b>${budgetName}</b>\nYou'll receive notifications if you start reaching your threshold limit.`,
        "HTML"
      );

      const getTotalQuery = `
      SELECT
        SUM(threshold) as total
      FROM
        budgets
      WHERE
        user = ?;
      `;
      const [[{ total }]] = (await db.promise().query({
        sql: getTotalQuery,
        values: [username],
      })) as unknown as [SumAggrT];
      sendMessage(
        chat_id,
        `Total monthly budget so far: <b>Rs. ${total}</b>.`,
        "HTML"
      );
    } else {
      sendMessage(chat_id, "Please enter a valid amount 😅");
    }
  } catch (error) {
    console.error(error);
  }
};
