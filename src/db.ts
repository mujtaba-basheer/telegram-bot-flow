import { createPool } from "mysql2";
import { config } from "dotenv";
config();

// creating db connection
const pool = createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE_NAME,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.log("Error connecting to database...");
    return console.error(err);
  }
  console.log("Database connected successfully");
  connection.release();
});

export default pool;
