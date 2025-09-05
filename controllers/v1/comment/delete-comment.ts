import { logger } from "../../../lib/winston.ts";
import type { Request, Response } from "express";
import Blog from "../../../models/blog.ts";
import Comment from "../../../models/comment.ts";
import User from "../../../models/user.ts";
import type { IComment } from "../../../models/comment.ts";

type CommentData = Pick<IComment, "content">;

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .select("userId blogId")
      .lean()
      .exec();
    const user = await User.findById(currentUserId)
      .select("role")
      .lean()
      .exec();

    if (!comment) {
      res.status(404).json({
        code: "NotFound",
        message: "Comment not found",
      });
      return;
    }

    const blog = await Blog.findById(comment.blogId)
      .select("commentsCount")
      .exec();

    if (!blog) {
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    if (comment.userId !== currentUserId && user?.role !== "admin") {
      res.status(403).json({
        code: "AuthorizationError",
        message: "You are not authorized to delete this comment",
      });
      logger.warn("A user tried to delete a comment without permission", {
        userId: currentUserId,
        commentId,
      });

      return;
    }

    await Comment.deleteOne({ _id: commentId });

    logger.info("Comment deleted successfully", {
      commentId,
    });

    blog.commentsCount--;
    await blog.save();

    logger.info("Blog comments count updated", {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error while deleting comment", err);
  }
};

export default deleteComment;
