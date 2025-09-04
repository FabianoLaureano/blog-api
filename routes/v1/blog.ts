import { Router } from "express";
import { param, query, body } from "express-validator";
import authenticate from "../../middlewares/authenticate.ts";
import validationError from "../../middlewares/validationError.ts";
import authorize from "../../middlewares/authorize.ts";
import createBlog from "../../controllers/v1/blog/create-blog.ts";
import multer from "multer";
import uploadBlogBanner from "../../middlewares/upload-blog-banner.ts";
import getAllBlogs from "../../controllers/v1/blog/get-all-blogs.ts";
import getBlogsByUser from "../../controllers/v1/blog/get-blogs-by-user.ts";

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

router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
  validationError,
  getAllBlogs
);

router.get(
  "/user/:userId",
  authenticate,
  authorize(["admin", "user"]),
  param("userId").isMongoId().withMessage("Invalid user ID"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
  validationError,
  getBlogsByUser
);

export default router;
