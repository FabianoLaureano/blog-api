import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import config from "../config/index.ts";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "../lib/express-rate-limit.ts";
import v1Routes from "../routes/v1/index.ts";
import { connectToDatabase, disconnectFromDatabase } from "../lib/mongoose.ts";
import { logger } from "../lib/winston.ts";

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      new Error(`CORS Error: ${origin} is not allowed by CORS`), false;
      logger.warn(`CORS Error: ${origin} is not allowed by CORS`);
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  })
);
app.use(helmet());
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error("Failer to start the server", err);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutDown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn("Server SHUTDOWN");
    process.exit(0);
  } catch (err) {
    logger.error("Error during server shutdown", err);
  }
};

process.on("SIGTERM", handleServerShutDown);
process.on("SIGINT", handleServerShutDown);
