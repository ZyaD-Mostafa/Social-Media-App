"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokedToken = exports.decodedToken = exports.createCredentials = exports.getSignature = exports.getSignatureLeaves = exports.LogOutEnum = exports.TokenTypeEnum = exports.SignatureLeavels = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../../DB/models/user.model");
const uuid_1 = require("uuid");
const error_response_1 = require("../response/error.response");
const user_repository_1 = require("../../DB/repository/user.repository");
const token_model_1 = require("../../DB/models/token.model");
const token_repository_1 = require("../../DB/repository/token.repository");
const generateToken = async ({ payload, secret, options, }) => {
    return await (0, jsonwebtoken_1.sign)(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = async ({ token, secret, }) => {
    return (await (0, jsonwebtoken_1.verify)(token, secret));
};
exports.verifyToken = verifyToken;
var SignatureLeavels;
(function (SignatureLeavels) {
    SignatureLeavels["USER"] = "USER";
    SignatureLeavels["ADMIN"] = "ADMIN";
})(SignatureLeavels || (exports.SignatureLeavels = SignatureLeavels = {}));
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum["ACCESS"] = "ACCESS";
    TokenTypeEnum["REFRESH"] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LogOutEnum;
(function (LogOutEnum) {
    LogOutEnum["ONLY"] = "ONLY";
    LogOutEnum["ALL"] = "ALL";
})(LogOutEnum || (exports.LogOutEnum = LogOutEnum = {}));
const getSignatureLeaves = async (role = user_model_1.RoleEnum.USER) => {
    let SignatureLeaves = SignatureLeavels.USER;
    switch (role) {
        case user_model_1.RoleEnum.ADMIN:
            SignatureLeaves = SignatureLeavels.ADMIN;
            break;
        case user_model_1.RoleEnum.USER:
            SignatureLeaves = SignatureLeavels.USER;
            break;
        default:
            break;
    }
    return SignatureLeaves;
};
exports.getSignatureLeaves = getSignatureLeaves;
const getSignature = async (SignatureLeaves = SignatureLeavels.USER) => {
    let signature = {
        access_token: " ",
        refresh_token: "",
    };
    switch (SignatureLeaves) {
        case SignatureLeavels.USER:
            signature.access_token = process.env.USER_ACCESS_TOKEN_SCERET;
            signature.refresh_token = process.env.USER_REFRESH_TOKEN_SCERET;
            break;
        case SignatureLeavels.ADMIN:
            signature.access_token = process.env.ADMIN_ACCESS_TOKEN_SCERET;
            signature.refresh_token = process.env
                .ADMIN_REFRESH_TOKEN_SCERET;
            break;
        default:
            break;
    }
    return signature;
};
exports.getSignature = getSignature;
const createCredentials = async (user) => {
    const getSignatureLeave = await (0, exports.getSignatureLeaves)(user.role);
    const signature = await (0, exports.getSignature)(getSignatureLeave);
    const jwtid = (0, uuid_1.v4)();
    const accessToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signature.access_token,
        options: {
            expiresIn: Number(process.env.ACCESS_EXPIRE_IN),
            jwtid,
        },
    });
    const refreshToken = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secret: signature.refresh_token,
        options: {
            expiresIn: Number(process.env.REFRESH_EXPIRE_IN),
            jwtid,
        },
    });
    return { accessToken, refreshToken };
};
exports.createCredentials = createCredentials;
const decodedToken = async ({ authoriztion, tokenType = TokenTypeEnum.ACCESS, }) => {
    if (!authoriztion)
        throw new error_response_1.UnAuthorizedRequestException("Missing Token parts");
    const [bearer, token] = authoriztion?.split(" ");
    if (!bearer || !token)
        throw new error_response_1.UnAuthorizedRequestException("Missing Token parts");
    const signatures = await (0, exports.getSignature)(bearer);
    const decoded = await (0, exports.verifyToken)({
        token,
        secret: tokenType === TokenTypeEnum.REFRESH
            ? signatures.refresh_token
            : signatures.access_token,
    });
    const userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    if (!decoded?._id || !decoded.iat)
        throw new error_response_1.UnAuthorizedRequestException("Invalid Token Payload");
    if (await tokenModel.findOne({ filter: { jti: decoded.jti } }))
        throw new error_response_1.NotFoundRequestException("Invalid OR old login creadentials");
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new error_response_1.NotFoundRequestException("User Not Found");
    if ((user.changeCredintaialstime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_1.UnAuthorizedRequestException("logedOut from All devices");
    }
    return { user, decoded };
};
exports.decodedToken = decodedToken;
const createRevokedToken = async (decoded) => {
    const tokenModel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    const [res] = (await tokenModel.create({
        data: [
            {
                jti: decoded.jti,
                expiresIn: decoded.iat,
                userId: decoded._id,
            },
        ],
    })) || [];
    if (!res)
        throw new error_response_1.BadRequestException("Fail to Create revoke Token");
    return res;
};
exports.createRevokedToken = createRevokedToken;
