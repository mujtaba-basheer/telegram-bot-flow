import { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import processUpdate from "../controller/process";
import { config } from "dotenv";
import { UpdateT } from "../../index.d";
config();

export const messageReceived = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const update = req.body as UpdateT;
    console.log(update);

    await processUpdate(update, res, next);
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};
