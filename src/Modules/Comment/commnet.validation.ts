import z from "zod";
import { generalFields } from "../../Middlewares/validations.middleware";
import { fileValidtion } from "../../Utils/multer/cloud.multer";



export const createCommentSchema ={
  body:z.strictObject({
    content:z.string().min(2).max(50000).optional(),
    attachments:z.array(generalFields.file(fileValidtion.images)).max(3).optional(),
    tags:z.array(generalFields.id).max(10).optional(),
  }).superRefine((data ,ctx)=>{
    if ( !data.attachments?.length && !data.content){
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
  params:z.strictObject({
    postId:generalFields.id
  })
}