import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gateway.dto";
import chatService from "./chat.service";

// chat events act as contoller (api in io )
export class ChatEvent {
  private _chatService = chatService;
  constructor() {}

  sayHi = (socket: IAuthSocket, io: Server) => {
    return socket.on("SayHi", (message, callback) => {
      this._chatService.sayHi({ message, socket, callback, io });
    });
  };

  sendMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendMessage",
      (data: { content: string; sendTo: string }) => {
        this._chatService.sendMessage({ ...data, socket, io });
      },
    );
  };


  joinRoom = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "join_room",
      (data: {roomId  :string }) => {
        this._chatService.joinRoom({ ...data, socket, io });
      },
    );
  };


  sendGroupMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendGroupMessage",
      (data: {content  :string  , groupId :string }) => {
        this._chatService.sendGroupMessage({ ...data, socket, io });
      },
    );
  };
}
