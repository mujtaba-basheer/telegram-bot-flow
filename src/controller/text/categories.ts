import { sendMessage, sendMessageKeyboard, slugify } from "../../utils/bot";
import store from "../../store";
const toEmoji = require("emoji-name-map");

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
  code: string,
  chat_id: number,
  command: string
) => Promise<void> = async (code, chat_id, command) => {
  try {
    code = code.trim().toLowerCase();
    console.log({ code });
    let emojiCode: string = "";
    console.log(toEmoji.get(code));
    for (const key of Object.keys(toEmoji.emoji)) {
      if (key === code) {
        emojiCode = code;
        break;
      }
    }

    if (emojiCode === "") {
      sendMessage(
        chat_id,
        "Sorry but we couldn't find this emoji-code in out records 😞\nPlease enter another emoji"
      );
      return;
    }

    await store.set(`${chat_id}:cat-emoji`, emojiCode);
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
