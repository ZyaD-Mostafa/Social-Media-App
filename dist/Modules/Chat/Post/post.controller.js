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
const post_validation_1 = require("./post.validation");
const commnet_controller_1 = __importDefault(require("../Comment/commnet.controller"));
const post_service_1 = __importDefault(require("./post.service"));
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)();
router.use("/:postId/comment", commnet_controller_1.default);
router.post("/", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    maxSizeMb: 5,
    validation: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
}).array("attachments", 3), (0, validations_middleware_1.validation)(post_validation_1.createPostSchema), post_service_1.default.createPost);
router.patch("/:postId/like", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(post_validation_1.likeUnLikePostSchema), post_service_1.default.likePost);
router.patch("/:postId/unLike", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(post_validation_1.likeUnLikePostSchema), post_service_1.default.unLikePost);
router.get("/", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), post_service_1.default.getAllPosts);
exports.default = router;
