import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import User from "../../../models/user.ts";
import type { IBlog } from "../../../models/blog.ts";

type BlogData = Partial<Pick<IBlog, "title" | "content" | "banner" | "status">>;

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, banner, status }: BlogData = req.body;
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select("role").lean().exec();
    const blog = await Blog.findById(blogId).select("-__v").exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    if (blog.author !== userId && user?.role !== "admin") {
      res.status(403).json({
        code: "AuthorizationError",
        message: "You are not authorized to update this blog",
      });
      logger.warn("A user tried to update a blog without permission", {
        userId,
        blog,
      });
      return;
    }

    if (title) blog.title = title;
    if (content) {
      const cleanContent = purify.sanitize(content);
      blog.content = cleanContent;
    }
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    await blog.save();

    logger.info("Blog updated successfully", { blog });

    res.status(200).json({
      blog,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during updation blog", err);
  }
};

export default updateBlog;
