"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_service_1 = __importDefault(require("./comment.service"));
const authentaication_middleware_1 = require("../../Middlewares/authentaication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
const commnet_validation_1 = require("./commnet.validation");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)({
    mergeParams: true,
});
router.post("/", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    maxSizeMb: 5,
    validation: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
}).array("attachments", 3), (0, validations_middleware_1.validation)(commnet_validation_1.createCommentSchema), comment_service_1.default.createComment);
exports.default = router;
