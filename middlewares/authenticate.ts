import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = pkg;

import { verifyAcessToken } from "../lib/jwt.ts";
import { logger } from "../lib/winston.ts";
import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      code: "AuthenticaionError",
      message: "Access denied, no token provided",
    });
    return;
  }

  const [_, token] = authHeader.split(" ");

  try {
    const jwtPayload = verifyAcessToken(token) as { userId: Types.ObjectId };

    req.userId = jwtPayload.userId;
    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticaionError",
        message: "Access token expired",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticaionError",
        message: "Access token invalid",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
    });
    logger.error("Error during authentication", err);
  }
};

export default authenticate;
