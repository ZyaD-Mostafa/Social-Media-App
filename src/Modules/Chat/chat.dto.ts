import z from "zod";
import { IAuthSocket } from "../gateway/gateway.dto";
import { createChatGroupSchema, getChatSchema, getGroupChatSchema } from "./chat.validation";
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
export interface IJoinRoomDto {
  roomId: string;
  socket: IAuthSocket;
  io :Server
}
export interface ISendGroupMessageDTO {
  content: string;
  groupId: string;
  socket: IAuthSocket;
  io :Server
}

export type getChatSDto = z.infer<typeof getChatSchema.params>
export type ICreateChatGroupSDto = z.infer<typeof createChatGroupSchema.body>
export type IGetChatGroupDto = z.infer<typeof getGroupChatSchema.params>