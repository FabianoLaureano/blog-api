import { Router } from "express";
import { param, query, body } from "express-validator";
import authenticate from "../../middlewares/authenticate.ts";
import validationError from "../../middlewares/validationError.ts";
import User from "../../models/user.ts";
import authorize from "../../middlewares/authorize.ts";
import getCurrentUser from "../../controllers/v1/user/get-current-user.ts";
import updateCurrentUser from "../../controllers/v1/user/update-current-user.ts";
import deleteCurrentUser from "../../controllers/v1/user/delete-current-user.ts";
import getAllUsers from "../../controllers/v1/user/get-all-users.ts";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser
);

router.put(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  body("username")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Username must be less than 20 characters")
    .custom(async (value) => {
      const userExists = await User.exists({ username: value });

      if (userExists) {
        throw new Error("Username already exists");
      }
    }),

  body("email")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 characters")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (value) => {
      const userExists = await User.exists({ email: value });

      if (userExists) {
        throw new Error("Email already in use");
      }
    }),

  body("password")
    .optional()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("first_name")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 characters"),

  body("last_name")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 characters"),

  body(["website", "facebook", "instagram", "linkedin", "x", "youtube"])
    .optional()
    .isURL()
    .withMessage("Invalid URL")
    .isLength({ max: 100 })
    .withMessage("URL must be less than 100 characters"),

  validationError,
  updateCurrentUser
);

router.delete(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  deleteCurrentUser
);

router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
  validationError,
  getAllUsers
);

export default router;
