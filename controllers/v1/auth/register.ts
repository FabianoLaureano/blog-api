import { logger } from "../../../lib/winston.ts";
import config from "../../../config/index.ts";
import type { Request, Response } from "express";
import User from "../../../models/user.ts";
import type { IUser } from "../../../models/user.ts";
import { generateAccessToken, generateRefreshToken } from "../../../lib/jwt.ts";

type UserData = Pick<IUser, "username" | "email" | "password" | "role">;

const register = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role } = req.body as UserData;

  const newUser = await User.create({
    username,
    email,
    password,
    role,
  });

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });

  try {
    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });

    logger.info("User registered successfully", {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
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
