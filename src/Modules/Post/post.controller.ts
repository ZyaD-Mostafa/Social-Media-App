import { Router } from "express";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validations.middleware";
import { createPostSchema, likeUnLikePostSchema } from "./post.validation";
import commentRouter from "../Comment/commnet.controller";
import postService from "./post.service";
import {
  cloudFileUpload,
  fileValidtion,
} from "../../Utils/multer/cloud.multer";

const router: Router = Router();

router.use("/:postId/comment", commentRouter);

// create post

router.post(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    maxSizeMb: 5,
    validation: [...fileValidtion.images, ...fileValidtion.pdf],
  }).array("attachments", 3),
  validation(createPostSchema),
  postService.createPost,
);

router.patch(
  "/:postId/like",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(likeUnLikePostSchema),
  postService.likePost,
);
router.patch(
  "/:postId/unLike",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(likeUnLikePostSchema),
  postService.unLikePost,
);
router.get(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  postService.getAllPosts,
);

export default router;
