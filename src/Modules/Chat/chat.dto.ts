import z from "zod";
import { IAuthSocket } from "../gateway/gateway.dto";
import { getChatSchema } from "./chat.validation";
import { Server } from "socket.io";

export interface ISayHiDto {
  message: string;
  socket: IAuthSocket;
  callback: any;
  io :Server

}
export interface ISendMessageDto {
  content: string;
  socket: IAuthSocket;
  sendTo: string;
  io :Server
}

export type getChatSDto = z.infer<typeof getChatSchema.params>