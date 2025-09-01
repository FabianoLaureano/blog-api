import { Router } from "express";
import register from "../../controllers/v1/auth/register.ts";
import { body } from "express-validator";
import validationError from "../../middlewares/validationError.ts";
import User from "../../models/user.ts";
import login from "../../controllers/v1/auth/login.ts";
import bcrypt from "bcrypt";

const router = Router();

router.post(
  "/register",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (userExists) {
        throw new Error("User email or password is invalid");
      }
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(["user", "admin"])
    .withMessage("Invalid role"),
  validationError,
  register
);

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });
      if (!userExists) {
        throw new Error("User email or password is invalid");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select("password")
        .lean()
        .exec();
      if (!user) {
        throw new Error("User email or password is invalid");
      }

      const passawordMatch = await bcrypt.compare(value, user.password);

      if (!passawordMatch) {
        throw new Error("User email or password is invalid");
      }
    }),
  validationError,
  login
);

export default router;
