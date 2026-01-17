import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils/response/error.response";

export const verifyMagicFileUpload = ({ allowTypes }: { allowTypes: string[] }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files
        ? Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat()
        : req.file
        ? [req.file]
        : [];

      if (!files.length) {
        throw new BadRequestException("No files uploaded");
      }

      for (const file of files) {
        const buffer = file.buffer ?? (file.path ? fs.readFileSync(file.path) : null);

        if (!buffer) {
          throw new BadRequestException("File buffer is required");
        }

        const type = await fileTypeFromBuffer(buffer);

        if (!type || !allowTypes.includes(type.mime)) {
          throw new BadRequestException(
            `Invalid file type detected: ${type?.mime ?? "unknown "}  , from magic number `
          );
        }
      }

      next();
    } catch (error) {
      next(new BadRequestException(`Error validating file: ${error}`));
    }
  };
};
