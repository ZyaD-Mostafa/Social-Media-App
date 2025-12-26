"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.ForbiddenRequestException = exports.UnAuthorizedRequestException = exports.ConflictRequestException = exports.NotFoundRequestException = exports.BadRequestException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode = 400, options) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundRequestException = NotFoundRequestException;
class ConflictRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConflictRequestException = ConflictRequestException;
class UnAuthorizedRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 401, options);
    }
}
exports.UnAuthorizedRequestException = UnAuthorizedRequestException;
class ForbiddenRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 403, options);
    }
}
exports.ForbiddenRequestException = ForbiddenRequestException;
const globalErrorHandler = (err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "sonething went wrong",
        stack: process.env.MODE === "DEV" ? err.stack : undefined,
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
