import store from "../store";
import db from "../db";
import { sendMessage, answerQuery, formatCurrency } from "../utils/bot";
import { CallbackQueryT, CategoryT } from "../../index";
const toEmoji = require("emoji-name-map");

const handleCategory: (
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
          }\nAmount: <b>${formatCurrency(
            +amount
          )}</b>\nCategory: ${name} ${toEmoji.get(emoji)}`,
          "HTML"
        );
        await db.promise().query(`
        INSERT INTO transactions
        VALUES (
          ${amount},
          NOW(),
          "${command.replace("/", "")}",
          "${category}",
          "${username}"
        );
        `);
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

const handleStats: (
  stats: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (stats, callback_query) => {
  const {
    from: { username },
    message: {
      chat: { id: chat_id },
    },
  } = callback_query;
  try {
    switch (stats) {
      case "recent": {
        type TxC = {
          amount: number;
          type: string;
          cname: string;
          cemoji: string;
          timestamp: string;
        };
        // @ts-ignore
        const [results] = await db.promise().query<TxC[]>(`
        SELECT
          amount, timestamp, transactions.type, categories.name AS cname, categories.emoji AS cemoji
        FROM
          transactions
        LEFT JOIN
          categories
        ON
          transactions.category = categories.slug
        WHERE
          transactions.user = "${username}"
        ORDER BY timestamp DESC
        LIMIT 10;
        `);
        let message = "Your most recent transactions:\n\n";
        for (let i = 0; i < results.length; i++) {
          const { amount, timestamp, type, cname, cemoji } = results[i];
          const d = new Date(timestamp);
          message += `Date: ${d.toDateString()}, ${d.toLocaleTimeString()}\n`;
          message += `Amount: <b>${formatCurrency(amount)}</b>\n`;
          message += `Type: ${type === "expend" ? "Expenditure" : "Earning"}\n`;
          message += `Category: ${cname} ${toEmoji.get(cemoji)}\n\n`;
        }
        sendMessage(chat_id, message, "HTML");

        break;
      }
      case "stats": {
        type ByTypeT = {
          type: string;
          sum: number;
        };
        // @ts-ignore
        const [byTypeRes] = await db.promise().query<ByTypeT[]>(`
        SELECT transactions.type, SUM(transactions.amount) AS sum
        FROM transactions
        WHERE transactions.user = "mujtaba_basheer"
        GROUP BY transactions.type;
        `);
        let total: number = byTypeRes.reduce<number>((p, c) => (p += c.sum), 0);

        let message = `Total transactions volume: <b>${formatCurrency(
          total
        )}</b>\n\n`;
        for (let i = 0; i < byTypeRes.length; i++) {
          const { type, sum } = byTypeRes[i];
          const percentage = ((sum / total) * 100).toFixed(2);
          const typeDisplay = type === "expend" ? "Expenditure" : "Earning";
          message += `${typeDisplay}: ${formatCurrency(
            sum
          )} (${percentage}%)\n`;
        }
        sendMessage(chat_id, message, "HTML");

        type ByCatT = {
          cname: string;
          cemoji: string;
          sum: number;
        };
        // @ts-ignore
        const [byCatRes] = await db.promise().query<ByCatT[]>(`
        SELECT categories.name as cname, categories.emoji as cemoji, SUM(transactions.amount) AS sum
        FROM transactions
        LEFT JOIN categories
        ON transactions.category = categories.slug
        WHERE transactions.user = "${username}" AND transactions.type = "expend"
        GROUP BY transactions.category;
        `);
        total = byCatRes.reduce<number>((p, c) => (p += c.sum), 0);
        message = `Expenditure breakdown:\n\n`;
        for (let i = 0; i < byCatRes.length; i++) {
          const { cemoji, cname, sum } = byCatRes[i];
          const percentage = ((sum / total) * 100).toFixed(2);
          const catDisplay = `${cname} ${toEmoji.get(cemoji)}`;
          message += `${catDisplay}: Rs. ${sum} (${percentage}%)\n`;
        }
        sendMessage(chat_id, message, "HTML");

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

const processQuery: (
  callback_query_id: string,
  callback_data: string,
  callback_query: CallbackQueryT
) => Promise<void> = async (
  callback_query_id,
  callback_data,
  callback_query
) => {
  const [chat_id, type, data] = callback_data.split(":");
  try {
    switch (type) {
      case "category": {
        handleCategory(data, callback_query);
        answerQuery(callback_query_id);
        break;
      }
      case "stats": {
        handleStats(data, callback_query);
        answerQuery(callback_query_id);
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

export default processQuery;
