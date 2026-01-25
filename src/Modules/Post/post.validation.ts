import z from "zod";
import { generalFields } from "../../Middlewares/validations.middleware";
import { fileValidtion } from "../../Utils/multer/cloud.multer";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
} from "../../DB/models/post.model";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().min(2).max(50000).optional(),
      attachments: z
        .array(generalFields.file(fileValidtion.images))
        .max(3)
        .optional(),
      allowComments: z
        .enum(AllowCommentsEnum)
        .default(AllowCommentsEnum.ALLOW)
        .optional(),
      availability: z
        .enum(AvailabilityEnum)
        .default(AvailabilityEnum.PUBLIC)
        .optional(),
      likes: z.array(generalFields.id).optional(),
      tags: z.array(generalFields.id).max(10).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.attachments?.length && !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Please Provide content or attachments",
        });
      }

      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Please Provide Unique Tags",
        });
      }
    }),
};

export const likeUnLikePostSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),

  //query: z.strictObject({ action: z.enum(LikesUnLikesEnum).default(LikesUnLikesEnum.LIKE), }),

};
