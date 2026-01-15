"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_config_1 = require("../../Utils/multer/s3.config");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getProfile = async (req, res) => {
        return res.status(200).json({
            message: "Done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        switch (flag) {
            case token_1.LogOutEnum.ONLY:
                await (0, token_1.createRevokedToken)(req.decoded);
                console.log("revoked");
                statusCode = 201;
                break;
            case token_1.LogOutEnum.ALL:
                await this._userModel.updateOne({
                    filter: { _id: req.decoded?._id },
                    update: { changeCredintaialstime: new Date() },
                });
                break;
            default:
                break;
        }
        return res.status(statusCode).json({
            message: "Done",
        });
    };
    profileImage = async (req, res) => {
        const Key = await (0, s3_config_1.uploadLargeFile)({
            path: `users/${req.decoded?._id}`,
            file: req.file,
        });
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update: {
                profileImage: Key,
                $inc: { __v: 1 },
            },
        });
        return res.status(200).json({
            message: "Done",
            Key,
        });
    };
    coverImages = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
        });
        await this._userModel.updateOne({
            filter: { _id: req.decoded?._id },
            update: {
                coverImage: [...urls],
                $inc: { __v: 1 },
            },
        });
        return res.status(200).json({
            message: "Done",
            urls,
        });
    };
}
exports.default = new UserService();
