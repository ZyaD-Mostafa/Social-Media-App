import express from "express";
import cors from "cors";
import type { Express, Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import path from "path";
import authRouter from "./Modules/Auth/auth.controller";
import UserRouter from "./Modules/User/user.controller";
import {
  BadRequestException,
  globalErrorHandler,
} from "./Utils/response/error.response";
import connDB from "./DB/connections";
import { createGetPresignedURL, getFile } from "./Utils/multer/s3.config";
import { promisify } from "util";
import { pipeline } from "stream";
config({ path: path.resolve("./config/.env.dev") });
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15M
  limit: 100,
  message: {
    status: 429,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});
const createS3WriteStreampipe = promisify(pipeline);
export const bootstrap = async () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;

  connDB();
  app.use(cors(), express.json(), helmet(), limiter);

  app.get("/uploads/pre-signed/*path", async (req, res) => {
    const { path } = req.params as unknown as { path: string[] };
    console.log(path);

    const Key = path.join("/");
    const url = await createGetPresignedURL({ Key });

    if (!url) throw new BadRequestException("Fail to fetch Asset");

    return res.status(200).json({
      message: "Done",
      url,
    });
  });
  //http://localhost:3000/SOCIAL_MEDIA_APP/users/
  // AWS SERVE STATIC FILES
  app.get("/uploads/*path", async (req, res) => {
    const { path } = req.params as unknown as { path: string[] };
    console.log(path);
    const { downloadName } = req.query;

    const Key = path.join("/");
    const s3Response = await getFile({ Key });

    if (!s3Response.Body) throw new BadRequestException("Fail to fetch Asset");

    res.setHeader(
      "Content-Type",
      s3Response.ContentType || "application/octet-stream",
    );
    if (downloadName) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${downloadName}`,
      );
    }

    return await createS3WriteStreampipe(
      s3Response.Body as NodeJS.ReadableStream,
      res,
    );
  });

  // GET Asset with presigned URL
  app.get("/uploads/pre-signed/*path", async (req, res) => {
    const { path } = req.params as unknown as { path: string[] };
    console.log(path);

    const Key = path.join("/");
    const url = await createGetPresignedURL({ Key });

    if (!url) throw new BadRequestException("Fail to fetch Asset");

    return res.status(200).json({
      message: "Done",
      url,
    });
  });

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      message: "Wlecome To Social Media App",
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", UserRouter);

  app.use("{/*dummy}", (req: Request, res: Response) => {
    res.status(404).json({
      message: "Not Found Handller",
    });
  });

  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`Server is Running on port`, port);
  });
};
