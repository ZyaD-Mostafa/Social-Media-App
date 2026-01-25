"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/models/post.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const s3_config_1 = require("../../Utils/multer/s3.config");
const comment_repository_1 = require("../../DB/repository/comment.repository");
const comment_model_1 = require("../../DB/models/comment.model");
class CommentService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _postModel = new post_repository_1.PostRepository(post_model_1.PostModel);
    _commentModel = new comment_repository_1.CommentRepository(comment_model_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                allowComments: post_model_1.AllowCommentsEnum.ALLOW,
                availability: post_model_1.AvailabilityEnum.PUBLIC,
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundRequestException("Post Not Found");
        }
        if (req.body.tags?.length &&
            (await this._userModel.find({ filter: { _id: req.body.tags } }))
                .length !== req.body.tags.length) {
            throw new error_response_1.NotFoundRequestException("some mentioned user done not exists");
        }
        let Attachments = [];
        if (req.files?.length) {
            Attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assetPostFolderId}`,
            });
        }
        const [comment] = (await this._commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments: Attachments,
                    postId,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!comment) {
            if (Attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: Attachments });
            }
            throw new error_response_1.BadRequestException("fail to create comment");
        }
        return res.status(200).json({
            message: "Comment created Successfuly",
        });
    };
}
exports.default = new CommentService();
