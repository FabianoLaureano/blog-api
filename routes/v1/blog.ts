import { Router } from "express";
import { param, query, body } from "express-validator";
import authenticate from "../../middlewares/authenticate.ts";
import validationError from "../../middlewares/validationError.ts";
import authorize from "../../middlewares/authorize.ts";
import createBlog from "../../controllers/v1/controller/create-blog.ts";
import multer from "multer";
import uploadBlogBanner from "../../middlewares/upload-blog-banner.ts";

const upload = multer();

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("banner_image"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 characters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be either draft or published"),
  validationError,
  uploadBlogBanner("post"),
  createBlog
);

export default router;
