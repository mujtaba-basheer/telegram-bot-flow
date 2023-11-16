import store from "../../store";
import db from "../../db";
import {
  sendMessage,
  sendMessageKeyboard,
  unicodeToEmoji,
} from "../../utils/bot";
import { CallbackQueryT } from "../../../index";
const toEmoji = require("emoji-name-map");

// when a user wishes to view/add categories
export const handleCategories: (
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
      case "add": {
        await store.set(`${chat_id}:next`, "cat-name");
        sendMessage(chat_id, "Please enter the category name (without emoji)");
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

// when a user selects the category type for the added category
export const handleCategoryType: (
  type: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (type, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    switch (type) {
      case "expend": {
        await store.set(`${chat_id}:next`, "set-is-recurring");

        const inline_keyboard = [
          [
            {
              text: "Yes 🔁",
              callback_data: `${chat_id}:set-is-recurring:yes`,
            },
            {
              text: "No 🚫",
              callback_data: `${chat_id}:set-is-recurring:no`,
            },
          ],
        ];
        const reply_markup = {
          inline_keyboard,
        };
        sendMessageKeyboard(
          chat_id,
          "Is this expense a recurring one?",
          reply_markup
        );

        break;
      }
      case "earning":
      default: {
        const category_name = await store.get(`${chat_id}:cat-name`);
        const slug = await store.get(`${chat_id}:cat-slug`);
        const emojiUnicode = await store.get(`${chat_id}:cat-emoji`);

        const insertQuery = `
        INSERT INTO
          categories
        (
          name,
          slug,
          type,
          user,
          emoji,
          scope
        ) VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          "custom"
        );
        `;

        await db.promise().query<any>({
          sql: insertQuery,
          values: [category_name, slug, type, username, emojiUnicode],
        });

        let message = "Added category:\n";
        message += `<b>Name:</b> ${category_name} ${
          emojiUnicode ? unicodeToEmoji(emojiUnicode) : ""
        }\n`;
        message += `<b>Type:</b> Source of earning`;
        sendMessage(chat_id, message, "HTML");

        await store.del(`${chat_id}:cat-name`);
        await store.del(`${chat_id}:cat-slug`);
        await store.del(`${chat_id}:cat-emoji`);
        await store.del(`${chat_id}:next`);
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

// when a user selects wether to add an emoji for the added category
export const handleShouldAddEmoji: (
  answer: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (answer, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    switch (answer) {
      case "yes": {
        await store.set(`${chat_id}:next`, "add-emoji");
        sendMessage(chat_id, "Please enter an emoji.");
        break;
      }
      case "no": {
        await store.set(`${chat_id}:next`, "cat-type");
        await store.set(`${chat_id}:emoji`, "");

        const inline_keyboard = [
          [
            {
              text: "Way of expenditure",
              callback_data: `${chat_id}:cat-type:expend`,
            },
            {
              text: "Source of earning",
              callback_data: `${chat_id}:cat-type:earning`,
            },
          ],
        ];
        const reply_markup = {
          inline_keyboard,
        };
        sendMessageKeyboard(
          chat_id,
          "Please select the category type from the inline keyboard.",
          reply_markup
        );

        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

// when a user selects wether added expense is recurring
export const handleIsRecurring: (
  answer: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (answer, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    await store.set(`${chat_id}:cat-is-recurring`, answer);
    await store.set(`${chat_id}:next`, "set-is-utils");

    const inline_keyboard = [
      [
        {
          text: "Yes ✅",
          callback_data: `${chat_id}:set-is-utils:yes`,
        },
        {
          text: "No 🚫",
          callback_data: `${chat_id}:set-is-utils:no`,
        },
      ],
    ];
    const reply_markup = {
      inline_keyboard,
    };
    sendMessageKeyboard(
      chat_id,
      "Does this category come under Essentials/Utilities?",
      reply_markup
    );
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

// when a user selects wether added expense is essential/utility
export const handleIsUtils: (
  answer: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (answer, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    const category_name = await store.get(`${chat_id}:cat-name`);
    const slug = await store.get(`${chat_id}:cat-slug`);
    const emojiUnicode = await store.get(`${chat_id}:cat-emoji`);
    const isRecurring =
      (await store.get(`${chat_id}:cat-is-recurring`)) === "yes" ? 1 : 0;
    const isUtils = answer === "yes" ? 1 : 0;

    const insertQuery = `
    INSERT INTO
      categories
    (
      name,
      slug,
      type,
      user,
      emoji,
      scope,
      isRecurring,
      isUtils
    ) VALUES (
      ?,
      ?,
      "expend",
      ?,
      ?,
      "custom",
      ?,
      ?
    );
    `;

    await db.promise().query<any>({
      sql: insertQuery,
      values: [
        category_name,
        slug,
        username,
        emojiUnicode,
        isRecurring,
        isUtils,
      ],
    });

    let message = "Added category:\n";
    message += `<b>Name:</b> ${category_name} ${
      emojiUnicode ? unicodeToEmoji(emojiUnicode) : ""
    }\n`;
    message += `<b>Type:</b> Way of expenditure`;
    sendMessage(chat_id, message, "HTML");

    await store.del(`${chat_id}:cat-name`);
    await store.del(`${chat_id}:cat-slug`);
    await store.del(`${chat_id}:cat-emoji`);
    await store.del(`${chat_id}:cat-is-recurring`);
    await store.del(`${chat_id}:next`);
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};
