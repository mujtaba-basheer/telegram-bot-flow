import { sendMessageKeyboard, slugify } from "../../utils/bot";
import store from "../../store";
const emojiUnicode = require("emoji-unicode");

// when a user enters the name of the category he/she wants to add
export const handleCategoryName: (
  name: string,
  chat_id: number,
  command: string
) => Promise<void> = async (name, chat_id, command) => {
  try {
    const slug = slugify(name, chat_id);
    await store.set(`${chat_id}:cat-name`, name);
    await store.set(`${chat_id}:cat-slug`, slug);
    await store.set(`${chat_id}:next`, "add-emoji?");

    const inline_keyboard = [
      [
        {
          text: "Yes 😃",
          callback_data: `${chat_id}:add-emoji?:yes`,
        },
        {
          text: "No 🚫",
          callback_data: `${chat_id}:add-emoji?:no`,
        },
      ],
    ];
    const reply_markup = {
      inline_keyboard,
    };
    sendMessageKeyboard(
      chat_id,
      "Please select if you wish to add an emoji for this category",
      reply_markup
    );
  } catch (error) {
    console.error(error);
  }
};

// when a user enters an emoji for the added category
export const handleCategoryEmoji: (
  text: string,
  chat_id: number,
  command: string
) => Promise<void> = async (text, chat_id, command) => {
  try {
    const emoji = text.trim();
    const unicode: string = emojiUnicode(emoji);

    await store.set(`${chat_id}:cat-emoji`, unicode);
    await store.set(`${chat_id}:next`, "cat-type");

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
  } catch (error) {
    console.error(error);
  }
};
