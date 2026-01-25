import { Request, Response } from "express";
import { UserRepository } from "../../DB/repository/user.repository";
import { HUserDocumnet, UserModel } from "../../DB/models/user.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { v4 as uuid } from "uuid";
import {
  AvailabilityEnum,
  LikesUnLikesEnum,
  PostModel,
} from "../../DB/models/post.model";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../Utils/response/error.response";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";
import { UpdateQuery } from "mongoose";

class PostService {
  private _userModel = new UserRepository(UserModel);
  private _postModel = new PostRepository(PostModel);
  constructor() {}

  createPost = async (req: Request, res: Response): Promise<Response> => {
    //Tags
    if (
      req.body.tags?.length &&
      (await this._userModel.find({ filter: { _id: req.body.tags } }))
        .length !== req.body.tags.length
    ) {
      throw new NotFoundRequestException("some mentioned user done not exists");
    }

    // Attachments
    let Attachments: string[] = [];
    let assetFolder = undefined;
    if (req.files?.length) {
      let assetPostFolderId = uuid();
      Attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/post/${assetPostFolderId}`,
      });
      assetFolder = assetPostFolderId;
    }

    // create post

    const [post] =
      (await this._postModel.create({
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
        await deleteFiles({ urls: Attachments });
      }
      throw new BadRequestException("fail to create post");
    }
    return res.status(200).json({
      message: "Post created Successfuly",
      post,
    });
  };
  //likePost = async (req: Request, res: Response): Promise<Response> => { const { postId } = req.params as unknown as { postId: string }; const { action } = req.query as unknown as { action: LikesUnLikesEnum }; let update: UpdateQuery<HUserDocumnet> = { $addToSet: { likes: req.user?._id }, }; if (action === LikesUnLikesEnum.UNLIKE) { update = { $pull: { likes: req.user?._id }, }; } const post = await this._postModel.findOneAndUpdate({ filter: { _id: postId, availability: AvailabilityEnum.PUBLIC }, update, }); if (!post) { throw new NotFoundRequestException("Post not found"); } return res.status(200).json({ message: "Post liked Successfuly", post, }); };

  likePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this._postModel.findOneAndUpdate({
      filter: { _id: postId, availability: AvailabilityEnum.PUBLIC },
      update: {
        $addToSet: {
          likes: req.user?._id,
        },
      },
    });

    if (!post) {
      throw new NotFoundRequestException("Post not found");
    }

    return res.status(200).json({
      message: "Post liked successfully",
      post,
    });
  };

  unLikePost = async (req: Request, res: Response): Promise<Response> => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this._postModel.findOneAndUpdate({
      filter: { _id: postId, availability: AvailabilityEnum.PUBLIC },
      update: {
        $pull: {
          likes: req.user?._id,
        },
      },
    });

    if (!post) {
      throw new NotFoundRequestException("Post not found");
    }

    return res.status(200).json({
      message: "Post unLiked successfully",
      post,
    });
  };

  getAllPosts = async (req: Request, res: Response) => {
    let { page, size } = req.query as unknown as { page: number; size: number };

    const posts = await this._postModel.paginate({
      filter: { availability: AvailabilityEnum.PUBLIC },
      page,
      size,
    });

    res.status(200).json({
      message: "All posts Fetched Successfuly",
      posts,
    });
  };
}

export default new PostService();
