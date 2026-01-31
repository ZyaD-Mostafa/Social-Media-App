"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initalize = void 0;
const socket_io_1 = require("socket.io");
const token_1 = require("../../Utils/security/token");
const token_2 = require("../../Utils/security/token");
const chat_gateway_1 = require("../Chat/chat.gateway");
let io = null;
const initalize = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
        },
    });
    const connectedSockets = new Map();
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, token_1.decodedToken)({
                tokenType: token_2.TokenTypeEnum.ACCESS,
                authoriztion: socket.handshake.auth.authorization,
            });
            const userTabs = connectedSockets.get(user._id.toString()) || [];
            userTabs.push(socket.id);
            connectedSockets.set(user._id.toString(), userTabs);
            socket.credentials = { user, decoded };
            next();
        }
        catch (error) {
            next(error);
        }
    });
    function disconnetion(socket) {
        socket.on("disconnect", () => {
            const userId = socket.credentials?.user._id?.toString();
            let remainingTabs = connectedSockets.get(userId)?.filter((tab) => tab !== socket.id) || [];
            if (remainingTabs.length) {
                connectedSockets.set(userId, remainingTabs);
            }
            else {
                connectedSockets.delete(userId);
            }
            console.log("After Delete : ", connectedSockets.get(userId));
            console.log(connectedSockets);
        });
    }
    const chatGateway = new chat_gateway_1.ChatGateway();
    io.on("connection", (socket) => {
        console.log(connectedSockets);
        chatGateway.register(socket, (0, exports.getIo)());
        disconnetion(socket);
    });
};
exports.initalize = initalize;
const getIo = () => {
    if (!io) {
        throw new Error("Socket.id not initialized");
    }
    return io;
};
exports.getIo = getIo;
