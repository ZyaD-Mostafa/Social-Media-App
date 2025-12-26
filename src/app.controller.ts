import express from "express";
import cors from "cors";
import type { Express,  Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import path from "path";
import authRouter from "./Modules/Auth/auth.controller";
import UserRouter from "./Modules/User/user.controller";
import { globalErrorHandler } from "./Utils/response/error.response";
import connDB from "./DB/connections";
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
export const bootstrap = () => {
  const app: Express = express();
  const port: number = Number(process.env.PORT) || 5000;

  connDB();
  app.use(cors(), express.json(), helmet(), limiter);
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



  app.use ( globalErrorHandler)
  app.listen(port, () => {
    console.log(`Server is Running on port` , port);
  });
};
