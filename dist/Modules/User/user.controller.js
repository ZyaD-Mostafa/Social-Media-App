"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentaication_middleware_1 = require("../../Middlewares/authentaication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_validation_1 = require("./user.validation");
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
const router = (0, express_1.Router)();
router.get("/profile", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.getProfile);
router.post("/logout", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(user_validation_1.logoutSchema), user_service_1.default.logout);
exports.default = router;
