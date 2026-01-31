import { Server } from "socket.io";
import { IAuthSocket } from "../gateway/gateway.dto";
import { ChatEvent } from "./chat.events";


export class ChatGateway {
    private _chatEvents : ChatEvent = new ChatEvent()
    constructor(){}

    register = ( socket: IAuthSocket  , io :Server) => {
        this._chatEvents.sayHi(socket , io )
        this._chatEvents.sendMessage(socket , io )
    }
}