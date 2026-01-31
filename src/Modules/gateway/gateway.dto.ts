import { Socket } from "socket.io";
import { HUserDocumnet } from "../../DB/models/user.model";
import { JwtPayload } from "jsonwebtoken";

export interface IAuthSocket extends Socket {
  credentials?: {
    user: Partial<HUserDocumnet>;
    decoded: JwtPayload;
  };
}
