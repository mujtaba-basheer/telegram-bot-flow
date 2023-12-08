import { sendMessage } from "../../utils/bot";
import store from "../../store";

// when a user enters the name of the saving goal
export const handleSavingsName: (
  name: string,
  chat_id: number
) => Promise<void> = async (name, chat_id) => {
  try {
    await store.set(`${chat_id}:goal-name`, name);
    await store.set(`${chat_id}:next`, "goal-amount");

    sendMessage(chat_id, "Please enter your target amount");
  } catch (error) {
    console.error(error);
  }
};

// When a user enters the target amount for saving
export const handleNumber: (
  text: string,
  chat_id: number
) => Promise<void> = async (text, chat_id) => {
  try {
    if (isNaN(+text)) {
      const textToLower = text.toLowerCase();
      if (
        textToLower.includes("rs") ||
        textToLower.includes("₹") ||
        textToLower.includes(",")
      ) {
        sendMessage(
          chat_id,
          "Please enter amount without currency code, symbol or commas 😅"
        );
      } else sendMessage(chat_id, "Please enter a valid number 😅");
      return;
    }
    await store.set(`${chat_id}:amount`, +text);
    await store.set(`${chat_id}:next`, "goal-duration");
    sendMessage(
      chat_id,
      "Sure 👍. When do wish to achieve your saving goal?\nPlease mention number of weeks from now"
    );
  } catch (error) {
    console.error(error);
  }
};

// When a user enters the saving goal duration in weeks
export const handleNumberOfWeeks: (
  text: string,
  chat_id: number
) => Promise<void> = async (text, chat_id) => {
  try {
    if (isNaN(+text) || text.includes(".") || +text < 1) {
      sendMessage(chat_id, "Please enter a valid whole number 😅");
      return;
    }

    const goalName = await store.get(`${chat_id}:goal-name`);
    const targetAmount = await store.get(`${chat_id}:amount`);

    console.log({
      goalName,
      targetAmount,
      durationInWeeks: +text,
    });
    // { goalName: 'Diver Watch', targetAmount: '15000', durationInWeeks: 3 }

    sendMessage(chat_id, "Thank you.");
  } catch (error) {
    console.error(error);
  }
};
