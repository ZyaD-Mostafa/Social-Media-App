import express from "express";
import cors from "cors";
import type { Express, Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import path from "path";
import authRouter from "./Modules/Auth/auth.controller";
import UserRouter from "./Modules/User/user.controller";
import postRouter from "./Modules/Post/post.controller";
import {
  BadRequestException,
  globalErrorHandler,
} from "./Utils/response/error.response";
import connDB from "./DB/connections";
import { createGetPresignedURL, getFile } from "./Utils/multer/s3.config";
import { promisify } from "util";
import { pipeline } from "stream";
import { Server } from "socket.io";
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
  app.use("/api/v1/post", postRouter);

  app.use("{/*dummy}", (req: Request, res: Response) => {
    res.status(404).json({
      message: "Not Found Handller",
    });
  });

  app.use(globalErrorHandler);

  const httpServer = app.listen(port, () => {
    console.log(`Server is Running on port`, port);
  });

  // socket io server creation and listen to httpServer
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // http://localhost:3000/
  let connectedSockets: string[] = [];
  io.on("connection", (socket) => {
    console.log(socket.id, "Classic Connection");
    connectedSockets.push(socket.id);
    //socket.emit() ----> send data to same cleint connect with me

    //io.emit() ----> send data to all clients
    //   io.emit("product", {id:1 , this: "product1" , price : 14451} , (res : Response)=>{
    //   console.log(res);
    //  });

    //socket.broadcast().emit() ----> send data to all clients except sender
    //  socket.broadcast.emit("product", {id:1 , this: "product1" , price : 14451} , (res : Response)=>{
    //   console.log(res);
    //  });
    //io.to(socket.id).emit() ----> send data to specific client

    // io.to(connectedSockets[connectedSockets.length - 3] as string).emit(
    //   "product",
    //   { id: 1, this: "product1", price: 14451 },
    //   (res: Response) => {
    //     console.log(res);
    //   },
    // );
    //io.except(socket.id).emit() ----> send data to all clients except sender
        io.except(connectedSockets[connectedSockets.length - 3] as string).emit(
      "product",
      { id: 1, this: "product1", price: 14451 },
      (res: Response) => {
        console.log(res);
      },
    );

    //  socket.emit("product", {id:1 , this: "product1" , price : 14451} , (res : Response)=>{
    //   console.log(res);

    //  });

    //  socket.on("SayHi" , (data , callback)=>{
    //   console.log(data);
    //   callback("back end rewcived the data ");
    //  })

    socket.on("disconnect", () => {
      console.log("Client disconnected : ", socket.id);
    });
  });

  // http://localhost:3000/admin
  io.of("/admin").on("connection", (socket) => {
    console.log(socket.id, "Admin Connection");

    socket.on("disconnect", () => {
      console.log("Client disconnected : ", socket.id);
    });
  });
};
