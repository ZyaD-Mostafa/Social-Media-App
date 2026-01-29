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
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const verfiyFileUpload_middleware_1 = require("../../Middlewares/verfiyFileUpload.middleware");
const router = (0, express_1.Router)();
router.get("/profile", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.getProfile);
router.post("/logout", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(user_validation_1.logoutSchema), user_service_1.default.logout);
router.patch("/profile-image", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    validation: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
    storageApproch: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMb: 3,
}).single("attachments"), (0, verfiyFileUpload_middleware_1.verifyMagicFileUpload)({
    allowTypes: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
}), user_service_1.default.profileImage);
router.patch("/profile-image-presigned", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.profileImagePresigned);
router.patch("/cover-image", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, cloud_multer_1.cloudFileUpload)({
    validation: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
    storageApproch: cloud_multer_1.StorageEnum.MEMORY,
    maxSizeMb: 3,
}).array("attachments", 5), (0, verfiyFileUpload_middleware_1.verifyMagicFileUpload)({
    allowTypes: [...cloud_multer_1.fileValidtion.images, ...cloud_multer_1.fileValidtion.pdf],
}), user_service_1.default.coverImages);
router.delete("/delete-file", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.deleteFile);
router.delete("/delete-files", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), user_service_1.default.deleteMultipleFiles);
router.post("/:userId/friend-request", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(user_validation_1.sendFriendRequsetSchema), user_service_1.default.sendFriendRequest);
router.patch("/:requestId/accept", (0, authentaication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.RoleEnum.USER]), (0, validations_middleware_1.validation)(user_validation_1.acceptFriendRequsetSchema), user_service_1.default.acceptFriendRequset);
exports.default = router;
