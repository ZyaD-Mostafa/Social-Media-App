import { NextFunction, Request, Response } from "express";
import { decodedToken, TokenTypeEnum } from "../Utils/security/token";
import { RoleEnum } from "../DB/models/user.model";
import {
  BadRequestException,
  ForbiddenRequestException,
} from "../Utils/response/error.response";

export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
  accessRole: RoleEnum[] = []
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization)
      throw new BadRequestException("Missing Authorization");

    const { decoded, user } = await decodedToken({
      authoriztion: req.headers.authorization,
      tokenType,
    });
    if (!accessRole.includes(user.role))
      throw new ForbiddenRequestException(
        "You Are Not Unauthorized to access this route"
      );
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};
