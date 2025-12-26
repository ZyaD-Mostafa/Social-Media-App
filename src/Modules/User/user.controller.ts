import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentaication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { RoleEnum } from "../../DB/models/user.model";
import { logoutSchema } from "./user.validation";
import { validation } from "../../Middlewares/validations.middleware";

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

export default router;
