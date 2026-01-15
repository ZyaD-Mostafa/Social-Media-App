import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import os from "os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response";

export const fileValidtion = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  videos: ["video/mp4", "video/3gpp", "video/quicktime"],
  pdf: ["application/pdf"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export enum StorageEnum {
  MEMORY = "MEMORY",
  DISK = "DISK",
}

export const cloudFileUpload = ({
  validation = [],
  storageApproch = StorageEnum.MEMORY,
  maxSizeMb = 2,
}: {
  validation?: String[];
  storageApproch?: StorageEnum;
  maxSizeMb?: number;
}) => {
  const storage: any =
    storageApproch === StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        });

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) {
    if (!validation.includes(file.mimetype)) {
      return cb(new BadRequestException("Invalid File type "));
    }

    return cb(null, true);
  }
  return multer({
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    storage,
  });
};



