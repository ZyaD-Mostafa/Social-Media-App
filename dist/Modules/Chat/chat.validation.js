"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupChatSchema = exports.createChatGroupSchema = exports.getChatSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
exports.getChatSchema = {
    params: zod_1.default.strictObject({
        userId: validations_middleware_1.generalFields.id,
    }),
};
exports.createChatGroupSchema = {
    body: zod_1.default
        .strictObject({
        particiants: zod_1.default
            .array(validations_middleware_1.generalFields.id)
            .min(2, "At least 2 participants required"),
        group: zod_1.default.string().min(1).max(100),
    })
        .superRefine((data, ctx) => {
        if (data.particiants?.length &&
            data.particiants.length !== [...new Set(data.particiants)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["particiants"],
                message: "Please Provide Unique particiants",
            });
        }
    }),
};
exports.getGroupChatSchema = {
    params: zod_1.default.strictObject({
        groupid: validations_middleware_1.generalFields.id,
    }),
};
