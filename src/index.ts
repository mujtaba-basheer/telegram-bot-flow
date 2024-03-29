import * as express from "express";
import { config } from "dotenv";
import { webhookRouter } from "./routes/index";

// importing middleware handlers
import { notFound, errorHandler } from "./middleware/error.js";
import cors from "./middleware/cors";

config();
const app = express();
app.options("*", cors());
app.use(cors());
app.use(express.json({ limit: "5mb" }));
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use("/api/webhook", webhookRouter);

// test endpoint
app.get("/*", (req: express.Request, res: express.Response) => {
  res.send("API is running\n");
});

app.use(notFound);
app.use(errorHandler);

// spinning up the server
const port = process.env.PORT || 5000;

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} on port ${port}...`)
);
