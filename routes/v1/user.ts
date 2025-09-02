import { Router } from "express";
import { param, query, body } from "express-validator";
import authenticate from "../../middlewares/authenticate.ts";
import validationError from "../../middlewares/validationError.ts";
//import User from "../../models/User.ts";
import authorize from "../../middlewares/authorize.ts";
import getCurrentUser from "../../controllers/v1/user/get-current-user.ts";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["admin", "user"]),
  getCurrentUser
);

export default router;
