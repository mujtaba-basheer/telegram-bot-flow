import { FieldInfo, queryCallback } from "mysql";
import db from "../db";

type QuerypT = <T>(
  query: string
) => Promise<{ results: T; fields: FieldInfo[] }>;

// query returning a promise
const queryp: QuerypT = (query) => {
  return new Promise((res, rej) => {
    const callback: queryCallback = (err, results, fields) => {
      if (err) rej(err);
      else res({ results, fields });
    };

    db.query(query, callback);
  });
};

export default queryp;
