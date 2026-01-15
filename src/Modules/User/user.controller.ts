import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { logoutSchema } from "./user.validation";
import { validation } from "../../Middlewares/validations.middleware";
import {
  cloudFileUpload,
  fileValidtion,
  StorageEnum,
} from "../../Utils/multer/cloud.multer";

const router: Router = Router();

router.get(
  "/profile",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  userService.getProfile
);
router.post(
  "/logout",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(logoutSchema),
  userService.logout
);

router.patch(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...fileValidtion.images],
    storageApproch: StorageEnum.MEMORY,
    maxSizeMb: 3,
  }).single("attachments"),

  userService.profileImage
);
router.patch(
  "/cover-image",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  cloudFileUpload({
    validation: [...fileValidtion.images],
    storageApproch: StorageEnum.MEMORY,
    maxSizeMb: 3,
  }).array("attachments", 5),

  userService.coverImages
);

export default router;
