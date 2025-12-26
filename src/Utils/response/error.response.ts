import { Request, Response, NextFunction } from "express";

export interface IError extends Error {
  statusCode: number;
}

export class ApplicationException  extends Error {
    constructor ( message :string , public statusCode : number = 400 ,  options?:ErrorOptions ){
        super(message , options)
        this.name=this.constructor.name
    }
}

export class BadRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 400, options);
    }
}

export class NotFoundRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 404, options);
    }
}
export class ConflictRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 409, options);
    }
}
export class UnAuthorizedRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 401, options);
    }
}
export class ForbiddenRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 403, options);
    }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "sonething went wrong",
    stack: process.env.MODE=== "DEV" ? err.stack : undefined,
    cause: err.cause,
  });
};

