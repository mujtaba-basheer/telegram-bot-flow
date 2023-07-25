import { sendMessage } from "../utils/bot";
import { processCommand } from "./command";
import processText from "./text";
import { NextFunction, Response } from "express";
import { UpdateT } from "../../index.d";
import processQuery from "./query";

const processUpdate = async (
  update: UpdateT,
  res: Response,
  next: NextFunction
) => {
  const { message, callback_query } = update;
  console.log(message);
  let c_id: number | string = "";
  try {
    if (message) {
      const {
        entities,
        text,
        chat: { id: chat_id },
      } = message;
      c_id = chat_id;

      const c_entities = entities
        ? entities.filter((e) => e.type === "bot_command")
        : [];
      if (entities && c_entities.length) {
        for (const entity of c_entities) {
          const { type, offset, length } = entity;
          if (type === "bot_command") {
            const command = text
              .substring(offset, offset + length + 1)
              .toLowerCase();
            processCommand(command, update);
            res.status(200).json({
              status: true,
              msg: "Update processed successfully!",
            });
            break;
          }
        }
        return;
      } else {
        processText(text, update);
      }
    } else if (callback_query) {
      const { id: callback_query_id, data: callback_data } = callback_query;
      processQuery(callback_query_id, callback_data, callback_query);
    }

    res.status(200).json({
      status: true,
      msg: "Update processed successfully!",
    });
  } catch (error) {
    console.error(error);
    if (error.errno === 1062) {
      sendMessage(c_id, "Your account has already been registered with us!");
    }
  }
};

export default processUpdate;
