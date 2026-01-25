"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const uuid_1 = require("uuid");
const post_model_1 = require("../../DB/models/post.model");
const error_response_1 = require("../../Utils/response/error.response");
const s3_config_1 = require("../../Utils/multer/s3.config");
class PostService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _postModel = new post_repository_1.PostRepository(post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length &&
            (await this._userModel.find({ filter: { _id: req.body.tags } }))
                .length !== req.body.tags.length) {
            throw new error_response_1.NotFoundRequestException("some mentioned user done not exists");
        }
        let Attachments = [];
        let assetFolder = undefined;
        if (req.files?.length) {
            let assetPostFolderId = (0, uuid_1.v4)();
            Attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${assetPostFolderId}`,
            });
            assetFolder = assetPostFolderId;
        }
        const [post] = (await this._postModel.create({
            data: [
                {
                    ...req.body,
                    attachments: Attachments,
                    assetPostFolderId: assetFolder,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!post) {
            if (Attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: Attachments });
            }
            throw new error_response_1.BadRequestException("fail to create post");
        }
        return res.status(200).json({
            message: "Post created Successfuly",
            post,
        });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findOneAndUpdate({
            filter: { _id: postId, availability: post_model_1.AvailabilityEnum.PUBLIC },
            update: {
                $addToSet: {
                    likes: req.user?._id,
                },
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundRequestException("Post not found");
        }
        return res.status(200).json({
            message: "Post liked successfully",
            post,
        });
    };
    unLikePost = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findOneAndUpdate({
            filter: { _id: postId, availability: post_model_1.AvailabilityEnum.PUBLIC },
            update: {
                $pull: {
                    likes: req.user?._id,
                },
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundRequestException("Post not found");
        }
        return res.status(200).json({
            message: "Post unLiked successfully",
            post,
        });
    };
    getAllPosts = async (req, res) => {
        let { page, size } = req.query;
        const posts = await this._postModel.paginate({
            filter: { availability: post_model_1.AvailabilityEnum.PUBLIC },
            page,
            size,
        });
        res.status(200).json({
            message: "All posts Fetched Successfuly",
            posts,
        });
    };
}
exports.default = new PostService();
