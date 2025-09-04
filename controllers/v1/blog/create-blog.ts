import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import type { IBlog } from "../../../models/blog.ts";

type BlogData = Pick<IBlog, "title" | "content" | "banner" | "status">;

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, banner, status }: BlogData = req.body;
    const userId = req.userId;

    const cleanContent = purify.sanitize(content);

    const newBlog: IBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status,
      author: userId,
    });

    logger.info("Blog created successfully", newBlog);

    res.status(201).json({
      blog: newBlog,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during blog creation", err);
  }
};

export default createBlog;
