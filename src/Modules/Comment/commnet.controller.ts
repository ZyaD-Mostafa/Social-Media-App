import { Router } from "express";
import commentService from "./comment.service";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validations.middleware";
import { createCommentSchema } from "./commnet.validation";
import {
  cloudFileUpload,
  fileValidtion,
} from "../../Utils/multer/cloud.multer";
const router: Router = Router({
  mergeParams: true,
});

//api/post/:postId/comment

router.post(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    maxSizeMb: 5,
    validation: [...fileValidtion.images, ...fileValidtion.pdf],
  }).array("attachments", 3),
  validation(createCommentSchema),
  commentService.createComment,
);
export default router;
