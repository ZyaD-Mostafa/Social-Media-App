"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptFriendRequsetSchema = exports.sendFriendRequsetSchema = exports.logoutSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const token_1 = require("../../Utils/security/token");
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
exports.logoutSchema = {
    body: zod_1.default.strictObject({
        flag: zod_1.default.enum(token_1.LogOutEnum).default(token_1.LogOutEnum.ONLY),
    }),
};
exports.sendFriendRequsetSchema = {
    params: zod_1.default.strictObject({
        userId: validations_middleware_1.generalFields.id,
    }),
};
exports.acceptFriendRequsetSchema = {
    params: zod_1.default.strictObject({
        requestId: validations_middleware_1.generalFields.id,
    }),
};
