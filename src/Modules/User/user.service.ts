import { Request, Response } from "express";
import { LogoutDto } from "./user.dto";
import { createRevokedToken, LogOutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import {
  createPresignedURL,
  deleteFiles,
  delteFile,
  uploadFile,
  uploadFiles,
} from "../../Utils/multer/s3.config";
import {
  BadRequestException,
  ConflictRequestException,
  NotFoundRequestException,
} from "../../Utils/response/error.response";
import { FriendRepository } from "../../DB/repository/friend.repository";
import { FriendModel } from "../../DB/models/friendsRequest.model";
import { Types } from "mongoose";
import { ChatModel } from "../../DB/models/chat.model";
import { ChatRepository } from "../../DB/repository/chat.repository";

class UserService {
  private _userModel = new UserRepository(UserModel);
  private _friendModel = new FriendRepository(FriendModel);
  private _chatModel = new ChatRepository(ChatModel);

  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    await req.user?.populate("friends");

    const groups = await this._chatModel.find({
      filter: {
        particiants: { $in: [req.user?._id as Types.ObjectId] },
        group: { $exists: true },
      },
    });

    if (!groups) throw new NotFoundRequestException("user not in a groups ");
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded, groups },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDto = req.body;
    let statusCode: number = 200;
    //const update: UpdateQuery<IUser> = {};

    // only

    switch (flag) {
      case LogOutEnum.ONLY:
        await createRevokedToken(req.decoded as JwtPayload);
        console.log("revoked");
        statusCode = 201;
        break;
      case LogOutEnum.ALL:
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

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    // upload small file
    const Key = await uploadFile({
      path: `users/${req.decoded?._id}`,
      file: req.file as Express.Multer.File,
    });

    //upload larage file
    // const Key = await uploadLargeFile({
    //   path: `users/${req.decoded?._id}`,
    //   file: req.file as Express.Multer.File,
    // });

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

  profileImagePresigned = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;
    const { url, Key } = await createPresignedURL({
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

  coverImages = async (req: Request, res: Response): Promise<Response> => {
    const urls = await uploadFiles({
      files: req.files as Express.Multer.File[],
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

  deleteFile = async (req: Request, res: Response): Promise<Response> => {
    const { Key } = req.body as { Key: string };
    const result = await delteFile({ Key });
    return res.status(200).json({
      message: "Done",
      result,
    });
  };

  deleteMultipleFiles = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { urls } = req.body as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new BadRequestException("urls must be a non-empty array");
    }
    const result = await deleteFiles({ urls });
    return res.status(200).json({
      message: "Done",
      result,
    });
  };

  sendFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };

    if (!userId) throw new BadRequestException("User Id is required");
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException("Invalid user id");
    }
    const currentUserId = req.user!._id;

    const checkFriendRequestExists = await this._friendModel.findOne({
      filter: {
        $or: [
          { createdBy: currentUserId, sendTo: new Types.ObjectId(userId) },
          { createdBy: new Types.ObjectId(userId), sendTo: currentUserId },
        ],
      },
    });

    if (checkFriendRequestExists)
      throw new ConflictRequestException("Friend Request Already Exists");

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

  acceptFriendRequset = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { requestId } = req.params as unknown as {
      requestId: Types.ObjectId;
    };

    const checkFriendRequestExists = await this._friendModel.findOneAndUpdate({
      filter: {
        _id: requestId,
        sendTo: req.user!._id,
        acceptedAt: { $exists: false },
      },
      update: {
        acceptedAt: new Date(),
        $inc: { __v: 1 },
      },
    });

    if (!checkFriendRequestExists)
      throw new BadRequestException("Fail to accept friend request");

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

export default new UserService();
