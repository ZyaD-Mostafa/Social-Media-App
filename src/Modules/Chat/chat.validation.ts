import z from "zod";
import { generalFields } from "../../Middlewares/validations.middleware";

export const getChatSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
export const createChatGroupSchema = {
  body: z
    .strictObject({
      particiants: z
        .array(generalFields.id)
        .min(2, "At least 2 participants required"),
      group: z.string().min(1).max(100),
    })
    .superRefine((data, ctx) => {
      if (
        data.particiants?.length &&
        data.particiants.length !== [...new Set(data.particiants)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["particiants"],
          message: "Please Provide Unique particiants",
        });
      }
    }),
};

export const getGroupChatSchema = {
  params: z.strictObject({
    groupid: generalFields.id,
  }),
};
