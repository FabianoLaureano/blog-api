//import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "../../../lib/winston.ts";
import Token from "../../../models/token.ts";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { verifyRefreshToken, generateAccessToken } from "../../../lib/jwt.ts";

import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = pkg;

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      return res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }

    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };

    const acessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      acessToken,
    });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Refresh token expired, please login again",
      });
      return;
    }

    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Invalid refresh token",
      });
      return;
    }

    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
  }
};

export default refreshToken;
