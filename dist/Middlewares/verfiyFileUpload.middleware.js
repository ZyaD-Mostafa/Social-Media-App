"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMagicFileUpload = void 0;
const file_type_1 = require("file-type");
const fs_1 = __importDefault(require("fs"));
const error_response_1 = require("../Utils/response/error.response");
const verifyMagicFileUpload = ({ allowTypes }) => {
    return async (req, res, next) => {
        try {
            const files = req.files
                ? Array.isArray(req.files)
                    ? req.files
                    : Object.values(req.files).flat()
                : req.file
                    ? [req.file]
                    : [];
            if (!files.length) {
                throw new error_response_1.BadRequestException("No files uploaded");
            }
            for (const file of files) {
                const buffer = file.buffer ?? (file.path ? fs_1.default.readFileSync(file.path) : null);
                if (!buffer) {
                    throw new error_response_1.BadRequestException("File buffer is required");
                }
                const type = await (0, file_type_1.fileTypeFromBuffer)(buffer);
                if (!type || !allowTypes.includes(type.mime)) {
                    throw new error_response_1.BadRequestException(`Invalid file type detected: ${type?.mime ?? "unknown "}  , from magic number `);
                }
            }
            next();
        }
        catch (error) {
            next(new error_response_1.BadRequestException(`Error validating file: ${error}`));
        }
    };
};
exports.verifyMagicFileUpload = verifyMagicFileUpload;
