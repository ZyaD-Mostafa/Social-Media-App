"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_config_1 = require("../../Utils/multer/s3.config");
const error_response_1 = require("../../Utils/response/error.response");
const friend_repository_1 = require("../../DB/repository/friend.repository");
const friendsRequest_model_1 = require("../../DB/models/friendsRequest.model");
const mongoose_1 = require("mongoose");
class UserService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _friendModel = new friend_repository_1.FriendRepository(friendsRequest_model_1.FriendModel);
    constructor() { }
    getProfile = async (req, res) => {
        await req.user?.populate("friends");
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
        const Key = await (0, s3_config_1.uploadFile)({
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
    profileImagePresigned = async (req, res) => {
        const { ContentType, originalname, } = req.body;
        const { url, Key } = await (0, s3_config_1.createPresignedURL)({
            ContentType,
            originalname,
            path: `users/${req.decoded?._id}`,
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
            url,
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
    deleteFile = async (req, res) => {
        const { Key } = req.body;
        const result = await (0, s3_config_1.delteFile)({ Key });
        return res.status(200).json({
            message: "Done",
            result,
        });
    };
    deleteMultipleFiles = async (req, res) => {
        const { urls } = req.body;
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            throw new error_response_1.BadRequestException("urls must be a non-empty array");
        }
        const result = await (0, s3_config_1.deleteFiles)({ urls });
        return res.status(200).json({
            message: "Done",
            result,
        });
    };
    sendFriendRequest = async (req, res) => {
        const { userId } = req.params;
        if (!userId)
            throw new error_response_1.BadRequestException("User Id is required");
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            throw new error_response_1.BadRequestException("Invalid user id");
        }
        const currentUserId = req.user._id;
        const checkFriendRequestExists = await this._friendModel.findOne({
            filter: {
                $or: [
                    { createdBy: currentUserId, sendTo: new mongoose_1.Types.ObjectId(userId) },
                    { createdBy: new mongoose_1.Types.ObjectId(userId), sendTo: currentUserId },
                ],
            },
        });
        if (checkFriendRequestExists)
            throw new error_response_1.ConflictRequestException("Friend Request Already Exists");
        [
            await this._friendModel.create({
                data: [
                    {
                        createdBy: currentUserId,
                        sendTo: userId,
                    },
                ],
            }),
        ];
        return res.status(200).json({
            message: "friend request sent successfully",
            data: { user: req.user?.username, sendTo: userId },
        });
    };
    acceptFriendRequset = async (req, res) => {
        const { requestId } = req.params;
        const checkFriendRequestExists = await this._friendModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user._id,
                acceptedAt: { $exists: false },
            },
            update: {
                acceptedAt: new Date(),
                $inc: { __v: 1 },
            },
        });
        if (!checkFriendRequestExists)
            throw new error_response_1.BadRequestException("Fail to accept friend request");
        await Promise.all([
            await this._userModel.updateOne({
                filter: {
                    _id: checkFriendRequestExists.createdBy,
                },
                update: {
                    $addToSet: {
                        friends: checkFriendRequestExists.sendTo,
                    },
                },
            }),
            await this._userModel.updateOne({
                filter: {
                    _id: checkFriendRequestExists.sendTo,
                },
                update: {
                    $addToSet: {
                        friends: checkFriendRequestExists.createdBy,
                    },
                },
            }),
        ]);
        return res.status(201).json({
            message: "Done",
        });
    };
}
exports.default = new UserService();
