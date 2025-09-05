import { Router } from "express";
import authenticate from "../../middlewares/authenticate.ts";
import authorize from "../../middlewares/authorize.ts";
import likeBlog from "../../controllers/v1/like/like-blog.ts";
import dislikeBlog from "../../controllers/v1/like/dislike-blog.ts";
import { body, param } from "express-validator";
import validationError from "../../middlewares/validationError.ts";

const router = Router();

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  validationError,
  likeBlog
);

router.delete(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),
  validationError,
  dislikeBlog
);

export default router;
