import { logger } from "../../../lib/winston.ts";
import config from "../../../config/index.ts";
import type { Request, Response } from "express";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json({
      message: "New user created",
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during user registration");
  }
};

export default register;
