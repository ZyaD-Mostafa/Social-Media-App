"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmEmailotpSchema = exports.signupSchema = exports.loginSchema = void 0;
const z = __importStar(require("zod"));
const validations_middleware_1 = require("../../Middlewares/validations.middleware");
exports.loginSchema = {
    body: z.strictObject({
        email: validations_middleware_1.generalFields.email,
        password: validations_middleware_1.generalFields.password,
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        username: validations_middleware_1.generalFields.username,
        confirmPassword: validations_middleware_1.generalFields.confirmPassword,
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                message: "password not match",
                path: ["confirmPassword"],
            });
        }
        if (data.username?.split(" ").length != 2) {
            ctx.addIssue({
                code: "custom",
                message: "User name must be 2 words",
                path: ["username"],
            });
        }
    }),
};
exports.confirmEmailotpSchema = {
    body: z.strictObject({
        email: validations_middleware_1.generalFields.email,
        otp: validations_middleware_1.generalFields.otp,
    }),
};
