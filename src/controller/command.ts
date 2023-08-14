import { sendMessage, sendMessageKeyboard } from "../utils/bot";
import db from "../db";
import { UpdateT, TransactionT } from "../../index.d";
import store from "../store";

const handleStart: (
  first_name: string,
  last_name: string,
  username: string,
  chat_id: number
) => Promise<void> = async (first_name, last_name, username, chat_id) => {
  try {
    await db.promise().query(`
    INSERT INTO
      users
    VALUES
    (
      "${first_name}",
      "${last_name}",
      "${username}",
      NULL,
      NOW()
    );
    `);
    sendMessage(chat_id, "Your account has been registered successfully!");
  } catch (error) {
    if (error.errno === 1062) {
      sendMessage(chat_id, "Your account has already been registered with us!");
    }
  }
};

const handleRecord: (
  type: "earning" | "expenditure",
  chat_id: number
) => Promise<void> = async (type, chat_id) => {
  try {
    await store.set(`${chat_id}:next`, "amount");
    sendMessage(chat_id, "Please enter the amount");
  } catch (error) {
    if (error.errno === 1062) {
      sendMessage(chat_id, "Your account has already been registered with us!");
    }
  }
};

const handleStats: (chat_id: number) => Promise<void> = async (chat_id) => {
  try {
    await store.set(`${chat_id}:next`, "type");
    const buttons = [
      [
        {
          text: "Recent Transactions 💸",
          callback_data: `${chat_id}:stats:recent`,
        },
      ],
      [
        {
          text: "Enlighten Me 📊",
          callback_data: `${chat_id}:stats:stats`,
        },
      ],
    ];
    const reply_markup = {
      inline_keyboard: buttons,
    };
    sendMessageKeyboard(chat_id, "Please select an option:", reply_markup);
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

const handleBudgets: (chat_id: number) => Promise<void> = async (chat_id) => {
  try {
    await store.set(`${chat_id}:next`, "view/set");
    const buttons = [
      [
        {
          text: "View Existing Budgets 📃",
          callback_data: `${chat_id}:budgets:view`,
        },
      ],
      [
        {
          text: "Set a new Budget 📝",
          callback_data: `${chat_id}:budgets:set`,
        },
      ],
    ];
    const reply_markup = {
      inline_keyboard: buttons,
    };
    sendMessageKeyboard(chat_id, "Please select an option:", reply_markup);
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

const handleCategories: (chat_id: number) => Promise<void> = async (
  chat_id
) => {
  try {
    await store.set(`${chat_id}:next`, "view/add");
    const buttons = [
      [
        {
          text: "View categories 🧐",
          callback_data: `${chat_id}:categories:view`,
        },
      ],
      [
        {
          text: "Add a category ➕",
          callback_data: `${chat_id}:categories:add`,
        },
      ],
    ];
    const reply_markup = {
      inline_keyboard: buttons,
    };
    sendMessageKeyboard(chat_id, "Please select an option:", reply_markup);
  } catch (error) {
    console.error(error);
    sendMessage(chat_id, "Oops! There was some error processing your data 😵‍💫");
  }
};

export const processCommand = async (command: string, update: UpdateT) => {
  const {
    message: {
      from: { first_name, last_name, username },
      chat: { id: chat_id },
    },
  } = update;
  try {
    await store.set(`${chat_id}:command`, command);
    switch (command) {
      case "/start": {
        await handleStart(first_name, last_name, username, chat_id);
        break;
      }
      case "/earning": {
        await handleRecord("earning", chat_id);
        break;
      }
      case "/expend": {
        await handleRecord("expenditure", chat_id);
        break;
      }
      case "/stats": {
        await handleStats(chat_id);
        break;
      }
      case "/budgets": {
        await handleBudgets(chat_id);
        break;
      }
      case "/categories": {
        await handleCategories(chat_id);
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
    if (error.errno === 1062) {
      sendMessage(chat_id, "Your account has already been registered with us!");
    }
  }
};

export default processCommand;
