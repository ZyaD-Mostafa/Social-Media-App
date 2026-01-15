"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3Config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const cloud_multer_1 = require("./cloud.multer");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.REGION,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3Config = s3Config;
const uploadFile = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.S3_Bucket_name, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Body: storageApproch === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    if (!command?.input?.Key) {
        throw new error_response_1.BadRequestException("Fail to upload file ");
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.S3_Bucket_name, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Body: storageApproch === cloud_multer_1.StorageEnum.MEMORY ? file.buffer : file.path,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}-${file.originalname}`,
            ContentType: file.mimetype,
        },
        partSize: 500 * 1024 * 1024,
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`upload large file progress ${progress}`);
    });
    const { Key } = await upload.done();
    if (!Key)
        throw new error_response_1.BadRequestException("fail to upload large file");
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageApproch = cloud_multer_1.StorageEnum.MEMORY, Bucket = process.env.S3_Bucket_name, ACL = "private", path = "general", files, }) => {
    let urls = [];
    for (const file of files) {
        const Key = await (0, exports.uploadFile)({
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
exports.uploadFiles = uploadFiles;
