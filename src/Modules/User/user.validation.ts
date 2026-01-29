import z from "zod";
import { LogOutEnum } from "../../Utils/security/token";
import { generalFields } from "../../Middlewares/validations.middleware";

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogOutEnum).default(LogOutEnum.ONLY),
  }),
};

export const sendFriendRequsetSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
export const acceptFriendRequsetSchema = {
  params: z.strictObject({
    requestId: generalFields.id,
  }),
};
