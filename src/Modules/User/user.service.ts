import { Request, Response } from "express";
import { LogoutDto } from "./user.dto";
import { createRevokedToken, LogOutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";

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
        console.log("revoked ");
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
}

export default new UserService();
