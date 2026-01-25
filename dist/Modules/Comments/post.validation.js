"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeUnLikePostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const post_model_1 = require("../../DB/models/post.model");
exports.createPostSchema = {
    body: zod_1.default
        .strictObject({
        content: zod_1.default.string().min(2).max(50000).optional(),
        attachments: zod_1.default
            .array(validations_middleware_1.generalFields.file(cloud_multer_1.fileValidtion.images))
            .max(3)
            .optional(),
        allowComments: zod_1.default
            .enum(post_model_1.AllowCommentsEnum)
            .default(post_model_1.AllowCommentsEnum.ALLOW)
            .optional(),
        availability: zod_1.default
            .enum(post_model_1.AvailabilityEnum)
            .default(post_model_1.AvailabilityEnum.PUBLIC)
            .optional(),
        likes: zod_1.default.array(validations_middleware_1.generalFields.id).optional(),
        tags: zod_1.default.array(validations_middleware_1.generalFields.id).max(10).optional(),
    })
        .superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Please Provide content or attachments",
            });
        }
        if (data.tags?.length &&
            data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Please Provide Unique Tags",
            });
        }
    }),
};
exports.likeUnLikePostSchema = {
    params: zod_1.default.strictObject({
        postId: validations_middleware_1.generalFields.id,
    }),
};
