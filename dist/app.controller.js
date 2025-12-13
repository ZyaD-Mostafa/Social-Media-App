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
const error_response_1 = require("./Utils/response/error.response");
const connections_1 = __importDefault(require("./DB/connections"));
(0, dotenv_1.config)({ path: path_1.default.resolve("./config/.env.dev") });
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
});
const bootstrap = () => {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 5000;
    (0, connections_1.default)();
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)(), limiter);
    app.get("/", (req, res) => {
        res.status(200).json({
            message: "Wlecome To Social Media App",
        });
    });
    app.use("/api/v1/auth", auth_controller_1.default);
    app.use("{/*dummy}", (req, res) => {
        res.status(404).json({
            message: "Not Found Handller",
        });
    });
    app.use(error_response_1.globalErrorHandler);
    app.listen(port, () => {
        console.log(`Server is Running on port ${port}`);
    });
};
exports.bootstrap = bootstrap;
