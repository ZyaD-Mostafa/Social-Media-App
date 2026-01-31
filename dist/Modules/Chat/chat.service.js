"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../../DB/models/chat.model");
const chat_repository_1 = require("../../DB/repository/chat.repository");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../../Utils/response/error.response");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
class ChatService {
    _chatModel = new chat_repository_1.ChatRepository(chat_model_1.ChatModel);
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this._chatModel.findOne({
            filter: {
                particiants: {
                    $all: [
                        req.user._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId),
                    ],
                },
                group: { $exists: false },
            },
            options: {
                populate: "particiants",
            },
        });
        if (!chat) {
            throw new error_response_1.NotFoundRequestException("Chat Not Found");
        }
        return res.status(200).json({ chat });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log(message);
            callback ? callback("I recived your message") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", {
                message: error?.message || "Something went wrong",
            });
        }
    };
    sendMessage = async ({ content, socket, sendTo, io }) => {
        try {
            const createdBy = socket.credentials?.user?._id;
            const user = await this._userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: [createdBy] },
                },
            });
            if (!user)
                throw new error_response_1.NotFoundRequestException("User Not Found");
            let chat = await this._chatModel.findOneAndUpdate({
                filter: {
                    particiants: {
                        $all: [createdBy, mongoose_1.Types.ObjectId.createFromHexString(sendTo)],
                    },
                    group: { $exists: false },
                },
                update: {
                    $push: {
                        messages: {
                            content,
                            createdBy,
                        },
                    },
                },
                options: { new: true },
            });
            if (!chat) {
                const [newChat] = (await this._chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [{ content, createdBy }],
                            particiants: [
                                createdBy,
                                mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                            ],
                        },
                    ],
                })) || [];
                if (!newChat)
                    throw new error_response_1.BadRequestException("Failed to create chat");
                chat = newChat;
            }
            io.emit("successMessage", { content });
            io.emit("newMessage", {
                content,
                from: socket.credentials?.user,
                to: sendTo,
            });
        }
        catch (error) {
            socket.emit("custom_error", {
                message: error?.message || "Something went wrong",
            });
        }
    };
}
exports.default = new ChatService();
