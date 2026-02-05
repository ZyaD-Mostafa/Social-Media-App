"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const auth_controller_1 = __importDefault(require("./Modules/Auth/auth.controller"));
const user_controller_1 = __importDefault(require("./Modules/User/user.controller"));
const post_controller_1 = __importDefault(require("./Modules/Post/post.controller"));
const chat_controller_1 = __importDefault(require("./Modules/Chat/chat.controller"));
const error_response_1 = require("./Utils/response/error.response");
const connections_1 = __importDefault(require("./DB/connections"));
const s3_config_1 = require("./Utils/multer/s3.config");
const util_1 = require("util");
const stream_1 = require("stream");
const gateway_1 = require("./Modules/gateway/gateway");
(0, dotenv_1.config)({ path: path_1.default.resolve("./config/.env.dev") });
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
});
const createS3WriteStreampipe = (0, util_1.promisify)(stream_1.pipeline);
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 5000;
    (0, connections_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)(), limiter);
    app.get("/uploads/pre-signed/*path", async (req, res) => {
        const { path } = req.params;
        console.log(path);
        const Key = path.join("/");
        const url = await (0, s3_config_1.createGetPresignedURL)({ Key });
        if (!url)
            throw new error_response_1.BadRequestException("Fail to fetch Asset");
        return res.status(200).json({
            message: "Done",
            url,
        });
    });
    app.get("/uploads/*path", async (req, res) => {
        const { path } = req.params;
        console.log(path);
        const { downloadName } = req.query;
        const Key = path.join("/");
        const s3Response = await (0, s3_config_1.getFile)({ Key });
        if (!s3Response.Body)
            throw new error_response_1.BadRequestException("Fail to fetch Asset");
        res.setHeader("Content-Type", s3Response.ContentType || "application/octet-stream");
        if (downloadName) {
            res.setHeader("Content-Disposition", `attachment; filename=${downloadName}`);
        }
        return await createS3WriteStreampipe(s3Response.Body, res);
    });
    app.get("/uploads/pre-signed/*path", async (req, res) => {
        const { path } = req.params;
        console.log(path);
        const Key = path.join("/");
        const url = await (0, s3_config_1.createGetPresignedURL)({ Key });
        if (!url)
            throw new error_response_1.BadRequestException("Fail to fetch Asset");
        return res.status(200).json({
            message: "Done",
            url,
        });
    });
    app.get("/", (req, res) => {
        res.status(200).json({
            message: "Wlecome To Social Media App",
        });
    });
    app.use("/api/v1/auth", auth_controller_1.default);
    app.use("/api/v1/user", user_controller_1.default);
    app.use("/api/v1/post", post_controller_1.default);
    app.use("/api/v1/chat", chat_controller_1.default);
    app.use("{/*dummy}", (req, res) => {
        res.status(404).json({
            message: "Not Found Handller",
        });
    });
    app.use(error_response_1.globalErrorHandler);
    const httpServer = app.listen(port, () => {
        console.log(`Server is Running on port`, port);
    });
    (0, gateway_1.initalize)(httpServer);
};
exports.bootstrap = bootstrap;
