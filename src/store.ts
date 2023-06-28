import { createClient } from "redis";

// creating redis client
const client = createClient({
  socket: {
    host: "localhost",
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
