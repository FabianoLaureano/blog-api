import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import Like from "../../../models/like.ts";

const likeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select("likesCount").exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    const existingLike = await Like.findOne({
      blogId,
      userId,
    })
      .lean()
      .exec();

    if (existingLike) {
      res.status(400).json({
        code: "BadRequest",
        message: "You have already liked this blog",
      });
      return;
    }

    await Like.create({
      blogId,
      userId,
    });

    blog.likesCount++;

    await blog.save();

    logger.info("Blog liked successfully", {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.status(201).json({
      likesCount: blog.likesCount,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during while liking blog", err);
  }
};

export default likeBlog;
