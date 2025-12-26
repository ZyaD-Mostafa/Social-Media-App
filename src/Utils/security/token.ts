import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { HUserDocumnet, RoleEnum, UserModel } from "../../DB/models/user.model";
import { v4 as uuid } from "uuid";
import {
  BadRequestException,
  NotFoundRequestException,
  UnAuthorizedRequestException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenModel } from "../../DB/models/token.model";
import { TokenRepository } from "../../DB/repository/token.repository";
import { decode } from "punycode";
export const generateToken = async ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}): Promise<string> => {
  return await sign(payload, secret, options);
};

export const verifyToken = async ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): Promise<JwtPayload> => {
  return (await verify(token, secret)) as JwtPayload;
};

export enum SignatureLeavels {
  USER = "USER",
  ADMIN = "ADMIN",
}
export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}
export enum LogOutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

//getSignatureLeaves(Role)
export const getSignatureLeaves = async (
  role: RoleEnum = RoleEnum.USER
): Promise<SignatureLeavels> => {
  let SignatureLeaves: SignatureLeavels = SignatureLeavels.USER;
  switch (role) {
    case RoleEnum.ADMIN:
      SignatureLeaves = SignatureLeavels.ADMIN;
      break;
    case RoleEnum.USER:
      SignatureLeaves = SignatureLeavels.USER;
      break;
    default:
      break;
  }

  return SignatureLeaves;
};
//getSignature

export const getSignature = async (
  SignatureLeaves: SignatureLeavels = SignatureLeavels.USER
): Promise<{ access_token: string; refresh_token: string }> => {
  let signature: { access_token: string; refresh_token: string } = {
    access_token: " ",
    refresh_token: "",
  };

  switch (SignatureLeaves) {
    case SignatureLeavels.USER:
      signature.access_token = process.env.USER_ACCESS_TOKEN_SCERET as string;
      signature.refresh_token = process.env.USER_REFRESH_TOKEN_SCERET as string;
      break;
    case SignatureLeavels.ADMIN:
      signature.access_token = process.env.ADMIN_ACCESS_TOKEN_SCERET as string;
      signature.refresh_token = process.env
        .ADMIN_REFRESH_TOKEN_SCERET as string;
      break;
    default:
      break;
  }

  return signature;
};
//Create credentials

export const createCredentials = async (
  user: HUserDocumnet
): Promise<{ accessToken: string; refreshToken: string }> => {
  const getSignatureLeave = await getSignatureLeaves(user.role);
  const signature = await getSignature(getSignatureLeave);

  const jwtid = uuid();
  const accessToken = await generateToken({
    payload: { _id: user._id },
    secret: signature.access_token,
    options: {
      expiresIn: Number(process.env.ACCESS_EXPIRE_IN),
      jwtid,
    },
  });
  const refreshToken = await generateToken({
    payload: { _id: user._id },
    secret: signature.refresh_token,
    options: {
      expiresIn: Number(process.env.REFRESH_EXPIRE_IN),
      jwtid,
    },
  });

  return { accessToken, refreshToken };
};

// decodeToken
export const decodedToken = async ({
  authoriztion,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  tokenType: TokenTypeEnum;
  authoriztion?: string;
}) => {
  if (!authoriztion)
    throw new UnAuthorizedRequestException("Missing Token parts");
  const [bearer, token] = authoriztion?.split(" ");
  if (!bearer || !token)
    throw new UnAuthorizedRequestException("Missing Token parts");

  const signatures = await getSignature(bearer as SignatureLeavels);
  const decoded = await verifyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.REFRESH
        ? signatures.refresh_token
        : signatures.access_token,
  });
  const userModel = new UserRepository(UserModel);
  const tokenModel = new TokenRepository(TokenModel);

  if (!decoded?._id || !decoded.iat)
    throw new UnAuthorizedRequestException("Invalid Token Payload");

  if (await tokenModel.findOne({ filter: { jti: decoded.jti as string } }))
    throw new NotFoundRequestException("Invalid OR old login creadentials");

  const user = await userModel.findOne({ filter: { _id: decoded._id } });
  if (!user) throw new NotFoundRequestException("User Not Found");

  if ((user.changeCredintaialstime?.getTime() || 0) > decoded.iat * 1000) {
    throw new UnAuthorizedRequestException("logedOut from All devices");
  }
  return { user, decoded };
};

export const createRevokedToken = async (decoded: JwtPayload) => {
  const tokenModel = new TokenRepository(TokenModel);

  const [res] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn: decoded.iat as number,
          userId: decoded._id,
        },
      ],
    })) || [];

  if (!res) throw new BadRequestException("Fail to Create revoke Token");

  return res;
};
