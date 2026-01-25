"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const error_response_1 = require("../Utils/response/error.response");
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path };
                    }),
                });
            }
            if (validationErrors.length > 0) {
                throw new error_response_1.BadRequestException("validation Error", {
                    cause: validationErrors,
                });
            }
        }
        return next();
    };
};
exports.validation = validation;
exports.generalFields = {
    username: zod_1.z
        .string({ error: "username is Required" })
        .min(3, { error: "username must be 3 char long" })
        .max(30, { error: "username must be 30 char long" }),
    email: zod_1.z.email({ error: "invalid Email address" }),
    password: zod_1.z.string().min(6, { error: "password must be 6 char long" }),
    confirmPassword: zod_1.z
        .string()
        .min(6, { error: "confirmPassword must be 6 char long" }),
    otp: zod_1.z.string().regex(/^\d{6}$/),
    file: function (minetype) {
        return zod_1.z
            .strictObject({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            mimetype: zod_1.z.enum(minetype),
            size: zod_1.z.number(),
            buffer: zod_1.z.any().optional(),
            path: zod_1.z.string().optional(),
        })
            .refine((data) => {
            return data.path || data.buffer;
        }, { error: "please provide a file " });
    },
    id: zod_1.z.string().refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data);
    }, { error: "Invalid ID " }),
};
