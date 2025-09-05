import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import Comment from "../../../models/comment.ts";
import type { IComment } from "../../../models/comment.ts";

type CommentData = Pick<IComment, "content">;

const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

const commentBlog = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body as CommentData;
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select("_id commentsCount").exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await Comment.create({
      blogId,
      content: cleanContent,
      userId,
    });

    logger.info("New comment created", newComment);

    blog.commentsCount++;
    await blog.save();

    logger.info("Blog comments count updated", {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.status(201).json({
      comment: newComment,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error during commenting in blog", err);
  }
};

export default commentBlog;
