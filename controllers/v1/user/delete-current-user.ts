import { logger } from "../../../lib/winston.ts";
import User from "../../../models/user.ts";
import Blog from "../../../models/blog.ts";
import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

const deleteCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    const blogs = await Blog.find({ author: userId })
      .select("banner.publicId")
      .lean()
      .exec();

    const publicIds = blogs.map((blog) => blog.banner.publicId);

    await cloudinary.api.delete_resources(publicIds);

    logger.info("Blog banners deleted from Cloudinary", { publicIds });

    await Blog.deleteMany({ author: userId });
    logger.info("Blogs deleted successfully", { userId, blogs });

    await User.deleteOne({ _id: userId });
    logger.info("Current user deleted successfully", { userId });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal Server Error",
      error: err,
    });
    logger.error("Error while deleting current user", err);
  }
};

export default deleteCurrentUser;
