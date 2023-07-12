"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
// query returning a promise
const queryp = (query) => {
    return new Promise((res, rej) => {
        const callback = (err, results, fields) => {
            if (err)
                rej(err);
            else
                res({ results, fields });
        };
        db_1.default.query(query, callback);
    });
};
exports.default = queryp;
