import { Server as httpServer } from "node:http";
import { Server } from "socket.io";
import { decodedToken } from "../../Utils/security/token";
import { TokenTypeEnum } from "../../Utils/security/token";
import { IAuthSocket } from "./gateway.dto";
import { ChatGateway } from "../Chat/chat.gateway";

let io: Server | null = null;
export const initalize = (httpServer: httpServer) => {
  // socket io server creation and listen to httpServer
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const connectedSockets = new Map<string, string[]>(); // key---->value
  // middleware socket
  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken({
        tokenType: TokenTypeEnum.ACCESS,
        authoriztion: socket.handshake.auth.authorization,
      });
      const userTabs = connectedSockets.get(user._id.toString()) || [];
      userTabs.push(socket.id);
      connectedSockets.set(user._id.toString(), userTabs);

      socket.credentials = { user, decoded };

      next();
    } catch (error: any) {
      next(error);
    }
  });

  // disconnect socket
  function disconnetion(socket: IAuthSocket) {
    socket.on("disconnect", () => {
      const userId = socket.credentials?.user._id?.toString() as string;
      let remainingTabs =
        connectedSockets.get(userId)?.filter((tab) => tab !== socket.id) || [];
      if (remainingTabs.length) {
        connectedSockets.set(userId, remainingTabs);
      } else {
        connectedSockets.delete(userId);
      }
      console.log("After Delete : ", connectedSockets.get(userId));
      console.log(connectedSockets);
    });
  }

  const chatGateway = new ChatGateway();
  // http://localhost:3000/   connection io
  io.on("connection", (socket: IAuthSocket) => {
    console.log(connectedSockets);

    chatGateway.register(socket, getIo());

    // console.log(socket.credentials?.user._id?.toString() as string);

    // call disconnetion
    disconnetion(socket);
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.id not initialized");
  }
  return io;
};
