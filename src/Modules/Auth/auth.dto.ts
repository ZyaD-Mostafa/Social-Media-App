import * as z from "zod"
import { loginSchema, signupSchema } from "./auth.validation"

export type IsginupDto = z.infer<typeof signupSchema.body>
export type IloginDto = z.infer<typeof loginSchema.body>