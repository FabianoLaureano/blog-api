import { logger } from "../../../lib/winston.ts";
import User from "../../../models/user.ts";
import type { Request, Response } from "express";

const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.userId;

  try {
    await User.deleteOne({ _id: userId });
    logger.info("User deleted successfully", { userId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error while deleting a user", err);
  }
};

export default deleteUserById;
