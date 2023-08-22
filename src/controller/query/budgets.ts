import store from "../../store";
import db from "../../db";
import {
  sendMessage,
  sendMessageKeyboard,
  updateMessageKeyboard,
} from "../../utils/bot";
import { CallbackQueryT, CategoryT } from "../../../index";
const toEmoji = require("emoji-name-map");

type SelectionT = {
  name: string;
  display: string;
  slug: string;
  selected: boolean;
}[];

// when a user wishes to view/set budgets
export const handleBudgets: (
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
      case "view": {
        type CategoryT = {
          name: string;
          slug: string;
          emoji: string;
          scope: string;
          type: string;
        };
        const selectQuery = `
        SELECT
          name, slug, emoji, scope, type
        FROM
          categories
        WHERE
          user = "global"
          OR user = ?;
        `;
        // @ts-ignore
        const [results] = await db.promise().query<CategoryT[]>({
          sql: selectQuery,
          values: [username],
        });
        let message = "<b>Global Categories:</b>\n";
        const globalCategories: CategoryT[] = [];
        const customCategories: CategoryT[] = [];
        results.forEach((c) => {
          if (c.scope === "global") globalCategories.push(c);
          else if (c.scope === "custom") customCategories.push(c);
        });
        globalCategories.forEach((c, i, arr) => {
          const { name, emoji, type } = c;
          message += `${name} ${emoji ? toEmoji.get(emoji) : ""} (${type})`;
          if (i !== arr.length - 1) message += "\n";
        });
        if (customCategories.length) {
          message += "\n\n<b>Custom Categories:</b>\n";
          customCategories.forEach((c, i, arr) => {
            const { name, emoji, type } = c;
            message += `${name} ${emoji ? toEmoji.get(emoji) : ""} (${type})`;
            if (i !== arr.length - 1) message += "\n";
          });
        }
        sendMessage(chat_id, message, "HTML");

        break;
      }
      case "set": {
        const selectQuery = `
        SELECT
          name, slug, emoji
        FROM
          categories
        WHERE
          type = "expend"
          AND (
            user = "global"
            OR user = "${username}"
          )
        `;
        const [results] = (await db
          .promise()
          .query(selectQuery)) as unknown as [CategoryT[]];

        const selection: SelectionT = results.map((c) => ({
          name: c.name,
          display: c.name,
          slug: c.slug,
          selected: false,
        }));

        const inline_keyboard = [
          ...selection.map((c) => [
            {
              text: c.name,
              callback_data: `${chat_id}:budget-categories:${c.slug}`,
            },
          ]),
          [
            {
              text: "Done ✅",
              callback_data: `${chat_id}:budget-categories:done`,
            },
          ],
        ];

        const reply_markup = {
          inline_keyboard,
        };

        sendMessage(
          chat_id,
          "Please note, any budgets you set will be active from the beginning of the next month"
        );
        sendMessageKeyboard(
          chat_id,
          "Please select the categories to inclde in the budget",
          reply_markup
        );
        await store.set(`${chat_id}:next`, "budget-categories");
        await store.set(
          `${chat_id}:budget-categories`,
          JSON.stringify(selection)
        );
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

// when a user selects categories to add in a budget
export const handleBudgetCategories: (
  slug: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (slug, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    const selectionStr = await store.get(`${chat_id}:budget-categories`);
    const selection = JSON.parse(selectionStr) as SelectionT;
    if (slug === "done") {
      if (selection.filter((c) => c.selected).length === 0) {
        sendMessage(chat_id, "Please select at least one category 😕");
      } else {
        sendMessage(
          chat_id,
          "Please enter the budget threshold amount (without commas or currency symbol)"
        );
        await store.set(`${chat_id}:next`, "budget-amount");
      }
    } else {
      selection.forEach((c) => {
        if (c.slug === slug) c.selected = !c.selected;
        c.display = `${c.selected ? "☑️ " : ""}${c.name}`;
      });

      const inline_keyboard = [
        ...selection.map((c) => [
          {
            text: c.display,
            callback_data: `${chat_id}:budget-categories:${c.slug}`,
          },
        ]),
        [
          {
            text: "Done ✅",
            callback_data: `${chat_id}:budget-categories:done`,
          },
        ],
      ];

      const reply_markup = {
        inline_keyboard,
      };

      updateMessageKeyboard(chat_id, reply_markup);
      await store.set(
        `${chat_id}:budget-categories`,
        JSON.stringify(selection)
      );
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};
