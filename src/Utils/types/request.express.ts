import { JwtPayload } from "jsonwebtoken";
import { HUserDocumnet } from "../../DB/models/user.model";

declare module "express-serve-static-core" {
    interface Request{
        user? : HUserDocumnet;
        decoded?: JwtPayload;
    }
}