import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { url } from "inspector";

export const s3Config = () => {
  return new S3Client({
    region: process.env.REGION as string,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.S3_Bucket_name as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path, // Storage
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
      // path
      file.originalname
    }`,
    ContentType: file.mimetype,
  });

  await s3Config().send(command);

  if (!command?.input?.Key) {
    throw new BadRequestException("Fail to upload file ");
  }

  return command.input.Key;
};

export const uploadLargeFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.S3_Bucket_name as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const upload = new Upload({
    client: s3Config(),
    params: {
      Bucket,
      ACL,
      Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path, // Storage
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${
        // path
        file.originalname
      }`,
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
  });
  upload.on("httpUploadProgress", (progress) => {
    console.log(`upload large file progress ${progress}`);
  });

  const { Key } = await upload.done();

  if (!Key) throw new BadRequestException("fail to upload large file");

  return Key;
};

export const uploadFiles = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.S3_Bucket_name as string,
  ACL = "private",
  path = "general",
  files,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  files: Express.Multer.File[];
}) => {
  let urls: string[] = [];
  // const urls = await
  for (const file of files) {
    const Key = await uploadFile({
      storageApproch,
      Bucket,
      ACL,
      path,
      file,
    });
    urls.push(Key);
  }

  return urls;
};
