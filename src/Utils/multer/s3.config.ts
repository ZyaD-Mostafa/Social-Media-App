import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageEnum } from "./cloud.multer";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const createPresignedURL = async ({
  Bucket = process.env.S3_Bucket_name as string,
  path = "general",
  ContentType,
  originalname,
  expiresIn = 120,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  originalname: string;
  expiresIn?: number;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${
      process.env.APPLICATION_NAME
    }/${path}/${uuid()}-presignedURL-${originalname}`,
    ContentType,
  });
  const url = await getSignedUrl(s3Config(), command, { expiresIn });
  if (!url || !command?.input.Key)
    throw new BadRequestException("fail to generate Pre URl");
  return { url, Key: command.input.Key };
};

export const getFile = async ({
  Bucket = process.env.S3_Bucket_name as string,
  Key,
}: {
  Bucket?: string;
  Key: string; //path
}): Promise<GetObjectCommandOutput> => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await s3Config().send(command);
};

export const createGetPresignedURL = async ({
  Bucket = process.env.S3_Bucket_name as string,
  Key,
  expiresIn = 120,
}: {
  Bucket?: string;
  Key: string;
  expiresIn?: number;
}): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });
  const url = await getSignedUrl(s3Config(), command, { expiresIn });
  if (!url) throw new BadRequestException("fail fetch url presgined");
  return url;
};

export const delteFile = async ({
  Bucket = process.env.S3_Bucket_name as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });
  return await s3Config().send(command);
};

export const deleteFiles = async ({
  Bucket = process.env.S3_Bucket_name as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}): Promise<DeleteObjectCommandOutput> => {
  const Objects = urls.map((url) => {
    return {
      Key: url,
    };
  });

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });
  return await s3Config().send(command);
};
