"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post("/signup", (0, validations_middleware_1.validation)(auth_validation_1.signupSchema), auth_service_1.default.signup);
router.post("/login", auth_service_1.default.login);
router.patch("/confirm-email", (0, validations_middleware_1.validation)(auth_validation_1.confirmEmailotpSchema), auth_service_1.default.confrimEmail);
exports.default = router;
