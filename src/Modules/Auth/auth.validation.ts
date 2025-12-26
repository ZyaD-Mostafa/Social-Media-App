import * as z from "zod";
import { generalFields } from "../../Middlewares/validations.middleware";

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "password not match",
          path: ["confirmPassword"],
        });
      }

      // username 2 words
      if (data.username?.split(" ").length != 2) {
        ctx.addIssue({
          code: "custom",
          message: "User name must be 2 words",
          path: ["username"],
        });
      }
    }),
};

export const confirmEmailotpSchema = {
  body: z.strictObject({
    email: generalFields.email,
    otp: generalFields.otp,
  }),
};


