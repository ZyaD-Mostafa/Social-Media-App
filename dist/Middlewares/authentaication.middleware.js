"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_1 = require("../Utils/security/token");
const error_response_1 = require("../Utils/response/error.response");
const authentication = (tokenType = token_1.TokenTypeEnum.ACCESS, accessRole = []) => {
    return async (req, res, next) => {
        if (!req.headers.authorization)
            throw new error_response_1.BadRequestException("Missing Authorization");
        const { decoded, user } = await (0, token_1.decodedToken)({
            authoriztion: req.headers.authorization,
            tokenType,
        });
        if (!accessRole.includes(user.role))
            throw new error_response_1.ForbiddenRequestException("You Are Not Unauthorized to access this route");
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
