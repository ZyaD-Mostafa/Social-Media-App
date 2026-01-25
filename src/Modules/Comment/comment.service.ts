import { Request, Response } from "express";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  PostModel,
} from "../../DB/models/post.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "../../DB/models/user.model";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../Utils/response/error.response";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { CommentModel } from "../../DB/models/comment.model";

class CommentService {
  private _userModel = new UserRepository(UserModel);
  private _postModel = new PostRepository(PostModel);
  private _commentModel = new CommentRepository(CommentModel);

  constructor() {}

  createComment = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this._postModel.findOne({
      filter: {
        _id: postId,
        allowComments: AllowCommentsEnum.ALLOW,
        availability: AvailabilityEnum.PUBLIC,
      },
    });

    if (!post) {
      throw new NotFoundRequestException("Post Not Found");
    }

    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: req.body.tags } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundRequestException("some mentioned user done not exists");
    }

    // Attachments
    let Attachments: string[] = [];
    if (req.files?.length) {
      Attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdBy}/post/${post.assetPostFolderId}`,
      });
    }

    const [comment] =
      (await this._commentModel.create({
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
        await deleteFiles({ urls: Attachments });
      }
      throw new BadRequestException("fail to create comment");
    }

    return res.status(200).json({
      message: "Comment created Successfuly",
    });
  };
}

export default new CommentService();
