import z from "zod"
import { LogOutEnum } from "../../Utils/security/token"

export  const logoutSchema = {
    body : z.object({
    flag: z.enum(LogOutEnum).default(LogOutEnum.ONLY)

})

}