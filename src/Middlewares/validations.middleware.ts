import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils/response/error.response";
import { ZodError, ZodType, z } from "zod";

type keyReqType = keyof Request;
type SchmeaType = Partial<Record<keyReqType, ZodType>>;

export const validation = (schema: SchmeaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationErrors: Array<{
      key: keyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];
    for (const key of Object.keys(schema) as keyReqType[]) {
      if (!schema[key]) continue;

      const validationResult = schema[key].safeParse(req[key]);
      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;
        validationErrors.push({
          key,
          issues: errors.issues.map((issue) => {
            return { message: issue.message, path: issue.path };
          }),
        });
      }

      if (validationErrors.length > 0) {
        throw new BadRequestException("validation Error", {
          cause: validationErrors,
        });
      }
    }

    return next() as unknown as NextFunction;
  };
};

export const generalFields = {
  username: z
    .string({ error: "username is Required" })
    .min(3, { error: "username must be 3 char long" })
    .max(30, { error: "username must be 30 char long" }),
  //defualt required

  email: z.email({ error: "invalid Email address" }),
  password: z.string().min(6, { error: "password must be 6 char long" }),
  confirmPassword: z
    .string()
    .min(6, { error: "confirmPassword must be 6 char long" }),
};
