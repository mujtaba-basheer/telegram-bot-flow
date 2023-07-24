import { config } from "dotenv";
import store from "../store";
import * as https from "https";
import {
  SendMessageFuncT,
  SendMessageKeyboardFuncT,
  AnswerQueryFuncT,
} from "../../index.d";
config();

type SendMessageRespT = {
  ok: boolean;
  result: {
    message_id: number;
  };
};

export const sendMessage: SendMessageFuncT = (chat_id, text, parse_mode) => {
  const data = JSON.stringify({
    chat_id,
    text,
    parse_mode: parse_mode,
  });

  const request = https.request(
    {
      hostname: "api.telegram.org",
      path: `/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    },
    (res) => {
      let data = "";

      res.on("error", (err) => console.error(err));

      res.on("data", (chunk) => (data += chunk.toString()));

      res.on("end", () => {
        if (res.statusCode === 200) console.log("Message sent successfully!");
        else console.log("Error Sending Message!");
      });
    }
  );

  request.write(data);
  // request.write(up.toString());
  request.end();
};

export const sendMessageKeyboard: SendMessageKeyboardFuncT = (
  chat_id,
  text,
  reply_markup
) => {
  const data = JSON.stringify({
    chat_id,
    text,
    reply_markup,
  });

  const request = https.request(
    {
      hostname: "api.telegram.org",
      path: `/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    },
    (res) => {
      let data = "";

      res.on("error", (err) => console.error(err));

      res.on("data", (chunk) => (data += chunk.toString()));

      res.on("end", async () => {
        if (res.statusCode === 200) {
          console.log("Message sent successfully!");
          const resp = JSON.parse(data) as SendMessageRespT;
          await store.set(`${chat_id}:message_id`, resp.result.message_id);
        } else {
          console.log("Error Sending Message!");
          console.log(data);
        }
      });
    }
  );

  request.write(data);
  // request.write(up.toString());
  request.end();
};

export const answerQuery: AnswerQueryFuncT = (
  callback_query_id,
  text,
  show_alert
) => {
  const data = JSON.stringify({
    callback_query_id,
    text,
    show_alert,
  });

  const request = https.request(
    {
      hostname: "api.telegram.org",
      path: `/bot${process.env.TELEGRAM_API_TOKEN}/answerCallbackQuery`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    },
    (res) => {
      let data = "";

      res.on("error", (err) => console.error(err));

      res.on("data", (chunk) => (data += chunk.toString()));

      res.on("end", () => {
        if (res.statusCode === 200) console.log("Query answered successfully!");
        else console.log("Error Answering Query!");
      });
    }
  );

  request.write(data);
  // request.write(up.toString());
  request.end();
};

export const formatCurrency: (amt: number) => string = (amt) => {
  const f = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return f.format(amt);
};

export const slugify: (categoryName: string, chat_id: number) => string = (
  categoryName,
  chat_id
) => {
  let slug: string = `${categoryName
    .toLowerCase()
    .replace(/[\s\n\t]/g, "_")}-${chat_id}`;
  return slug;
};
