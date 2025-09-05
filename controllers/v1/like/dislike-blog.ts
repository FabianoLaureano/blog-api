import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import Like from "../../../models/like.ts";

const dislikeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const existingLike = await Like.findOneAndDelete({
      blogId,
      userId,
    })
      .lean()
      .exec();

    if (!existingLike) {
      res.status(404).json({
        code: "NotFound",
        message: "Like not found",
      });
      return;
    }

    await Like.deleteOne({ _id: existingLike._id });

    const blog = await Blog.findById(blogId).select("likesCount").exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    blog.likesCount--;

    await blog.save();

    logger.info("Blog disliked successfully", {
      userId,
      blogId: blog._id,
      likesCount: blog.likesCount,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during while disliking blog", err);
  }
};

export default dislikeBlog;
