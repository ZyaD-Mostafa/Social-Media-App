import { Request, Response } from "express";
import { LogoutDto } from "./user.dto";
import { createRevokedToken, LogOutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import {
  createPresignedURL,
  delteFile,
  delteFiles,
  uploadFile,
  uploadFiles,
  uploadLargeFile,
} from "../../Utils/multer/s3.config";
import { BadRequestException } from "../../Utils/response/error.response";

class UserService {
  private _userModel = new UserRepository(UserModel);

  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded },
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
    const result = await delteFiles({ urls });
    return res.status(200).json({
      message: "Done",
      result,
    });
  };
}

export default new UserService();
