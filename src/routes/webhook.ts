import { Router } from "express";
import { messageReceived } from "../apis/webhook";

const webhookRouter = Router();

// message received
webhookRouter.post("/message-received", messageReceived);

export default webhookRouter;
