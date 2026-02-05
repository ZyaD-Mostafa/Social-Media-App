import { Router } from "express";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validations.middleware";
import { createChatGroupSchema, getChatSchema, getGroupChatSchema } from "./chat.validation";
import chatService from "./chat.service";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getChatSchema),
  chatService.getChat,
);
router.post(
  "/group",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(createChatGroupSchema),
  chatService.createGroupChat,
);
router.get(
  "/getChat/:groupid",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getGroupChatSchema),
  chatService.getGroupChat,
);

export default router;
