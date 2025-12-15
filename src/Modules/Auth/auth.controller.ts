import { Response, Router , Request} from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validations.middleware";
import { confirmEmailotpSchema, signupSchema } from "./auth.validation";
const router : Router = Router();


router.post("/signup" , validation(signupSchema)  , authService.signup ) 

router.post("/login" ,authService.login )
router.patch("/confirm-email" , validation(confirmEmailotpSchema) , authService.confrimEmail )





export default router;