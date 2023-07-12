import { createClient } from "redis";
import { config } from "dotenv";
config();

// creating redis client
const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

(async () => {
  client.on("ready", async () => {
    console.log("Redis client connected successfully");
  });

  await client.connect();
})();

client.on("error", (err) => {
  console.log("Error " + err);
});

export default client;
