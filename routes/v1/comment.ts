import { Router } from "express";
import authenticate from "../../middlewares/authenticate.ts";
import authorize from "../../middlewares/authorize.ts";
import { body, param } from "express-validator";
import validationError from "../../middlewares/validationError.ts";
import commentBlog from "../../controllers/v1/comment/comment-blog.ts";

const router = Router();

router.post(
  "/blog/:blogId",
  authenticate,
  authorize(["admin", "user"]),
  param("blogId").isMongoId().withMessage("Invalid blog ID"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  validationError,
  commentBlog
);

export default router;
