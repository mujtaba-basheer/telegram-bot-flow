import { sendMessageKeyboard } from "../../utils/bot";
import db from "../../db";
import { CategoryT } from "../../../index.d";
import store from "../../store";
const toEmoji = require("emoji-name-map");

export const handleNumber: (
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
