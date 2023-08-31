"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../utils/bot");
const command_1 = require("./command");
const text_1 = require("./text");
const query_1 = require("./query");
const processUpdate = async (update, res, next) => {
    const { message, callback_query } = update;
    let c_id = "";
    try {
        if (message) {
            const { entities, text, chat: { id: chat_id }, } = message;
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
                        (0, command_1.processCommand)(command, update);
                        res.status(200).json({
                            status: true,
                            msg: "Update processed successfully!",
                        });
                        break;
                    }
                }
                return;
            }
            else {
                (0, text_1.default)(text, update);
            }
        }
        else if (callback_query) {
            const { id: callback_query_id, data: callback_data } = callback_query;
            (0, query_1.default)(callback_query_id, callback_data, callback_query);
        }
        res.status(200).json({
            status: true,
            msg: "Update processed successfully!",
        });
    }
    catch (error) {
        console.error(error);
        if (error.errno === 1062) {
            (0, bot_1.sendMessage)(c_id, "Your account has already been registered with us!");
        }
    }
};
exports.default = processUpdate;
