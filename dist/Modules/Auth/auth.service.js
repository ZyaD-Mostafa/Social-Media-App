"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const hash_1 = require("../../Utils/security/hash");
const generateOTP_1 = require("../../Utils/security/generateOTP");
const email_event_1 = require("../../Utils/events/email.event");
class AuthService {
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const checkUser = await this._userModel.findOne({
            filter: { email },
            select: "email",
        });
        if (checkUser)
            throw new error_response_1.ConflictRequestException("User already exists");
        const otp = (0, generateOTP_1.generateOTP)();
        const user = await this._userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_1.generateHash)(password),
                    confirmEmilOTP: await (0, hash_1.generateHash)(otp),
                    otpExpireAt: new Date(Date.now() + 3 * 60 * 1000),
                },
            ],
            options: { validateBeforeSave: true },
        });
        await email_event_1.emailEvent.emit("confirmEmil", {
            to: email,
            username,
            otp,
        });
        return res.status(201).json({
            message: "User created successfully",
            user,
        });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        console.log({ email, password });
        res.status(200).json({
            message: "User logged in successfully",
        });
    };
    confrimEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this._userModel.findOne({
            filter: {
                email,
                confirmEmilOTP: { $exists: true },
                confirmedAT: { $exists: false },
            },
        });
        if (!user)
            throw new error_response_1.NotFoundRequestException("User Not Found!");
        const isValidOtp = await (0, hash_1.compareHash)({
            plainText: otp,
            hash: user.confirmEmilOTP,
        });
        if (!isValidOtp) {
            throw new error_response_1.BadRequestException("Invalid OTP");
        }
        if (user.otpExpireAt && new Date() > user.otpExpireAt) {
            throw new error_response_1.BadRequestException("OTP Expired");
        }
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
exports.default = new AuthService();
