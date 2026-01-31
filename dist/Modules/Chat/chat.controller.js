"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentaication_middleware_1 = require("../../Middlewares/authentaication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
const chat_validation_1 = require("./chat.validation");
const chat_service_1 = __importDefault(require("./chat.service"));
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(chat_validation_1.getChatSchema), chat_service_1.default.getChat);
exports.default = router;
