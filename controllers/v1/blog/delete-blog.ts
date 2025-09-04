import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import User from "../../../models/user.ts";
import { v2 as cloudinary } from "cloudinary";

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    const user = await User.findById(userId).select("role").lean().exec();
    const blog = await Blog.findById(blogId)
      .select("author banner.publicId")
      .lean()
      .exec();

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
        message: "You are not authorized to delete this blog",
      });
      logger.warn("A user tried to delete a blog without permission", {
        userId,
      });
      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);

    logger.info("Blog banner deleted from Cloudinary", {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });

    logger.info("Blog deleted successfully", { blogId });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during blog deletion", err);
  }
};

export default deleteBlog;
