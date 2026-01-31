import { Router } from "express";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validations.middleware";
import { getChatSchema } from "./chat.validation";
import chatService from "./chat.service";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  authentication(TokenTypeEnum.ACCESS, [RoleEnum.USER]),
  validation(getChatSchema),
  chatService.getChat,
);

export default router;
