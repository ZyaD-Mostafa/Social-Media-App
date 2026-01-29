import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import {
  acceptFriendRequsetSchema,
  logoutSchema,
  sendFriendRequsetSchema,
} from "./user.validation";
import { validation } from "../../Middlewares/validations.middleware";
import {
  cloudFileUpload,
  fileValidtion,
  StorageEnum,
} from "../../Utils/multer/cloud.multer";
import { verifyMagicFileUpload } from "../../Middlewares/verfiyFileUpload.middleware";

const router: Router = Router();

router.get(
  "/profile",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.getProfile,
);
router.post(
  "/logout",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(logoutSchema),
  userService.logout,
);

router.patch(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...fileValidtion.images, ...fileValidtion.pdf],
    storageApproch: StorageEnum.MEMORY,
    maxSizeMb: 3,
  }).single("attachments"),
  verifyMagicFileUpload({
    allowTypes: [...fileValidtion.images, ...fileValidtion.pdf],
  }),

  userService.profileImage,
);
router.patch(
  "/profile-image-presigned",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.profileImagePresigned,
);
router.patch(
  "/cover-image",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...fileValidtion.images, ...fileValidtion.pdf],
    storageApproch: StorageEnum.MEMORY,
    maxSizeMb: 3,
  }).array("attachments", 5),
  verifyMagicFileUpload({
    allowTypes: [...fileValidtion.images, ...fileValidtion.pdf],
  }),

  userService.coverImages,
);

router.delete(
  "/delete-file",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.deleteFile,
);

router.delete(
  "/delete-files",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.deleteMultipleFiles,
);

router.post(
  "/:userId/friend-request",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(sendFriendRequsetSchema),
  userService.sendFriendRequest,
);

router.patch(
  "/:requestId/accept",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(acceptFriendRequsetSchema),
  userService.acceptFriendRequset,
);

export default router;
