import { sendMessage, sendMessageKeyboard, slugify } from "../utils/bot";
import db from "../db";
import { UpdateT, CategoryT } from "../../index.d";
import store from "../store";
const toEmoji = require("emoji-name-map");

const handleNumber: (
  amt: number,
  chat_id: number,
  username: string,
  command: string
) => Promise<void> = async (amt, chat_id, username, command) => {
  try {
    await store.set(`${chat_id}:amount`, amt);
    const [results] = await db.promise().query(
      `SELECT
        name, slug, emoji
       FROM
        categories
       WHERE
        type = "${command.replace("/", "")}"
        AND (
          user = "global"
          OR user = "${username}"
        );
      `
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
          text: c.name + (c.emoji ? " " + toEmoji.get(c.emoji) : ""),
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

// when a user enters the name of the category he/she wants to add
const handleCategoryName: (
  name: string,
  chat_id: number,
  command: string
) => Promise<void> = async (name, chat_id, command) => {
  try {
    {
      console.log(name, name.split(" "));
      sendMessage(chat_id, "Yo");
      return;
    }
    const slug = slugify(name, chat_id);
    await store.set(`${chat_id}:cat-name`, name);
    await store.set(`${chat_id}:cat-slug`, slug);

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

export const processText: (
  text: string,
  update: UpdateT
) => Promise<void> = async (text, update) => {
  const {
    message: {
      chat: { id: chat_id, username },
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
              handleNumber(+text, chat_id, username, command);
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
      case "/categories": {
        const next = await store.get(`${chat_id}:next`);
        switch (next) {
          case "cat-name": {
            if (text.includes("\n")) {
              sendMessage(
                chat_id,
                "Please do not inlcude line breaks in category name 😅"
              );
            } else handleCategoryName(text, chat_id, command);
            break;
          }
        }
        break;
      }
      default: {
        sendMessage(chat_id, "Invalid command or option 😅");
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
