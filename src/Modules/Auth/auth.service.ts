import { Request, Response } from "express";
import {
  BadRequestException,
  ConflictRequestException,
  NotFoundRequestException,
} from "../../Utils/response/error.response";
import { IconfrimEmailOtpDto, IloginDto, IsginupDto } from "./auth.dto";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { generateOTP } from "../../Utils/security/generateOTP";
import { emailEvent } from "../../Utils/events/email.event";

class AuthService {
  private _userModel = new UserRepository(UserModel);

  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: IsginupDto = req.body;

    const checkUser = await this._userModel.findOne({
      filter: { email },
      select: "email",
    });

    if (checkUser) throw new ConflictRequestException("User already exists");

    const otp = generateOTP();
    // otpExpireAt = new Date(Date.now() + 60 * 60 * 1000); // minut
    const user = await this._userModel.createUser({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmilOTP: await generateHash(otp),
          otpExpireAt: new Date(Date.now() + 3 * 60 * 1000),
        },
      ],
      options: { validateBeforeSave: true },
    });

    await emailEvent.emit("confirmEmil", {
      to: email,
      username,
      otp,
    });
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  };

  login = async (req: Request, res: Response) => {
    const { email, password }: IloginDto = req.body;

    console.log({ email, password });

    res.status(200).json({
      message: "User logged in successfully",
    });
  };

  confrimEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IconfrimEmailOtpDto = req.body;

    const user = await this._userModel.findOne({
      filter: {
        email,
        confirmEmilOTP: { $exists: true },
        confirmedAT: { $exists: false },
      },
    });

    if (!user) throw new NotFoundRequestException("User Not Found!");

    const isValidOtp = await compareHash({
      plainText: otp,
      hash: user.confirmEmilOTP as string,
    });

    if (!isValidOtp) {
      throw new BadRequestException("Invalid OTP");
    }

    if (user.otpExpireAt && new Date() > user.otpExpireAt) {
      throw new BadRequestException("OTP Expired");
    }
    //update user

    await this._userModel.updateOne({
      filter: { email },
      update: {
        confirmedAT: new Date(),
        $unset: { confirmEmilOTP: 1, otpExpireAt: 1 },
      },
    });
    return res.status(200).json({
      message: "User Confrimed Successfully",
    });
  };
}

export default new AuthService();
