import store from "../store";
import db from "../db";
import { sendMessage, answerQuery, formatCurrency } from "../utils/bot";
import { CallbackQueryT, CategoryT } from "../../index";
const toEmoji = require("emoji-name-map");

// when a user selects the category for an expediture/earning
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
          }\nAmount: <b>${formatCurrency(+amount)}</b>\nCategory: ${name} ${
            emoji ? toEmoji.get(emoji) : ""
          }`,
          "HTML"
        );

        console.log({ username, category });
        const insertQuery = `
        INSERT INTO transactions
        (
          amount,
          timestamp,
          type,
          category,
          user
        )
        VALUES (
          ?,
          NOW(),
          ?,
          ?,
          ?
        );
        `;
        await db.promise().query({
          sql: insertQuery,
          values: [amount, command.replace("/", ""), category, username],
        });
        break;
      }
      default: {
        sendMessage(
          chat_id,
          "Oops! There was some error processing your data 😵‍💫"
        );
        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

// when a user selects the kind of stats he/she wants to see
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
        if (results.length) {
          for (let i = 0; i < results.length; i++) {
            const { amount, timestamp, type, cname, cemoji } = results[i];
            const d = new Date(timestamp);
            message += `Date: ${d.toDateString()}, ${d.toLocaleTimeString()}\n`;
            message += `Amount: <b>${formatCurrency(amount)}</b>\n`;
            message += `Type: ${
              type === "expend" ? "Expenditure" : "Earning"
            }\n`;
            message += `Category: ${cname} ${
              cemoji ? toEmoji.get(cemoji) : ""
            }\n\n`;
          }
          sendMessage(chat_id, message, "HTML");
        } else {
          sendMessage(
            chat_id,
            "Seems like you've no recent transactions at the moment 😬",
            "HTML"
          );
        }

        break;
      }
      case "stats": {
        type ByTypeT = {
          type: string;
          sum: number;
        };
        // @ts-ignore
        const [byTypeRes] = await db.promise().query<ByTypeT[]>(`
        SELECT
          transactions.type, SUM(transactions.amount) AS sum
        FROM
          transactions
        WHERE
          transactions.user = "mujtaba_basheer"
        GROUP BY
          transactions.type;
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
        SELECT
          categories.name as cname, categories.emoji as cemoji, SUM(transactions.amount) AS sum
        FROM
          transactions
        LEFT JOIN
          categories
        ON
          transactions.category = categories.slug
        WHERE
          transactions.user = "${username}" AND transactions.type = "expend"
        GROUP BY
          transactions.category,
          categories.name,
          categories.emoji;
        `);
        total = byCatRes.reduce<number>((p, c) => (p += c.sum), 0);
        if (byCatRes.length) {
          message = `Expenditure breakdown:\n\n`;
          for (let i = 0; i < byCatRes.length; i++) {
            const { cemoji, cname, sum } = byCatRes[i];
            const percentage = ((sum / total) * 100).toFixed(2);
            const catDisplay = `${cname} ${cemoji ? toEmoji.get(cemoji) : ""}`;
            message += `${catDisplay}: Rs. ${sum} (${percentage}%)\n`;
          }
        } else {
          message = "There are no recorded expenditures at the moment 🧐";
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

// when a user wishes to view/add categories
const handleCategories: (
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
        sendMessage(chat_id, "Please enter the category name");
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
const handleCategoryType: (
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
    const category_name = await store.get(`${chat_id}:cat-name`);
    const slug = await store.get(`${chat_id}:cat-slug`);

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
      "",
      "custom"
    );
    `;

    await db.promise().query<any>({
      sql: insertQuery,
      values: [category_name, slug, type, username],
    });

    let message = "Added category:\n";
    message += `<b>Name:</b> ${category_name}\n`;
    message += `<b>Type:</b> ${
      type === "expend" ? "Way of expenditure" : "Source of earning"
    }`;
    sendMessage(chat_id, message, "HTML");
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
      case "categories": {
        handleCategories(data, callback_query);
        answerQuery(callback_query_id);
        break;
      }
      case "cat-type": {
        handleCategoryType(data, callback_query);
        answerQuery(callback_query_id);
        break;
      }
      default: {
        sendMessage(
          chat_id,
          "Oops! There was some error processing your data 😵‍💫"
        );
        break;
      }
    }
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

export default processQuery;
