import { Response, Router , Request} from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validations.middleware";
import { signupSchema } from "./auth.validation";
const router : Router = Router();


router.post("/signup" , validation(signupSchema)  , authService.signup ) 

router.post("/login" ,authService.login )





export default router;