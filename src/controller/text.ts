import { sendMessage, sendMessageKeyboard } from "../utils/bot";
import queryp from "../utils/db";
import { UpdateT, CategoryT } from "../../index.d";
import store from "../store";
const toEmoji = require("emoji-name-map");

const handleNumber: (
  amt: number,
  chat_id: number,
  command: string
) => Promise<void> = async (amt, chat_id, command) => {
  try {
    await store.set(`${chat_id}:amount`, amt);
    const { results } = await queryp(
      `SELECT name, slug, emoji FROM categories WHERE type = "${command.replace(
        "/",
        ""
      )}";`
    );
    const categories = results as CategoryT[];
    const buttons = [],
      row = [];
    for (const category of categories) {
      const { name, slug } = category;
      if (row.length === 2) {
        buttons.push([...row]);
        row.pop();
        row.pop();
        row.push({
          text: name,
          callback_data: slug,
        });
      } else {
        row.push({
          text: name,
          callback_data: slug,
        });
      }
    }
    const reply_markup = {
      inline_keyboard: categories.map((c) => [
        {
          text: c.name + " " + toEmoji.get(c.emoji),
          callback_data: `${chat_id}:category:${c.slug}`,
        },
      ]),
    };
    sendMessageKeyboard(
      chat_id,
      command === "/earning"
        ? "Awesome 🤑\nWhat was the source of this earning?"
        : "Sure. Under which category should this expenditure be placed?",
      reply_markup
    );
  } catch (error) {
    console.error(error);
  }
};

export const processText = async (text: string, update: UpdateT) => {
  const {
    message: {
      chat: { id: chat_id },
    },
  } = update;
  try {
    const command = await store.get(`${chat_id}:command`);
    switch (command) {
      case "/earning":
      case "/expend": {
        const next = await store.get(`${chat_id}:next`);
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
              handleNumber(+text, chat_id, command);
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
      default: {
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
