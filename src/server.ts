import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import config from "../config/index.ts";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import limiter from "../lib/express-rate-limit.ts";
import v1Routes from "../routes/v1/index.ts";

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
    }
    console.log(`CORS Error: ${origin} is not allowed by CORS`);
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
    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      console.log(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    console.log("Failer to start the server", err);

    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

const handleServerShutDown = async () => {
  try {
    console.log("Server SHUTDOWN");
    process.exit(0);
  } catch (err) {
    console.log("Error during server shutdown", err);
  }
};

process.on("SIGTERM", handleServerShutDown);
process.on("SIGINT", handleServerShutDown);
