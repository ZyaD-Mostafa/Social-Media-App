import { Request, Response } from "express";
import { getChatSDto, ISayHiDto, ISendMessageDto } from "./chat.dto";
import { ChatModel } from "../../DB/models/chat.model";
import { ChatRepository } from "../../DB/repository/chat.repository";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundRequestException,
} from "../../Utils/response/error.response";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";

class ChatService {
  private _chatModel = new ChatRepository(ChatModel);
  private _userModel = new UserRepository(UserModel);
  constructor() {}

  //REST API

  getChat = async (req: Request, res: Response) => {
    const { userId } = req.params as getChatSDto;
    const chat = await this._chatModel.findOne({
      filter: {
        particiants: {
          $all: [
            req.user!._id as Types.ObjectId,
            Types.ObjectId.createFromHexString(userId),
          ],
        },
        group: { $exists: false },
      },
      options: {
        populate: "particiants",
      },
    });
    if (!chat) {
      throw new NotFoundRequestException("Chat Not Found");
    }
    return res.status(200).json({ chat });
  };

  //Socket IO

  sayHi = ({ message, socket, callback, io }: ISayHiDto) => {
    try {
      console.log(message);
      callback ? callback("I recived your message") : undefined;
    } catch (error :any) {
      socket.emit("custom_error", {
      message: error?.message || "Something went wrong",
  });
    }
  };

  sendMessage = async ({ content, socket, sendTo, io }: ISendMessageDto) => {
    try {
      const createdBy = socket.credentials?.user?._id as Types.ObjectId;

      const user = await this._userModel.findOne({
        filter: {
          _id: Types.ObjectId.createFromHexString(sendTo),
          friends: { $in: [createdBy] },
        },
      });
      if (!user) throw new NotFoundRequestException("User Not Found");

      let chat = await this._chatModel.findOneAndUpdate({
        filter: {
          particiants: {
            $all: [createdBy, Types.ObjectId.createFromHexString(sendTo)],
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
        const [newChat] =
          (await this._chatModel.create({
            data: [
              {
                createdBy,
                messages: [{ content, createdBy }],
                particiants: [
                  createdBy,
                  Types.ObjectId.createFromHexString(sendTo),
                ],
              },
            ],
          })) || [];

        if (!newChat) throw new BadRequestException("Failed to create chat");
        chat = newChat;
      }

      // ✅ emit دايمًا
      io.emit("successMessage", { content });

      io.emit("newMessage", {
        content,
        from: socket.credentials?.user,
        to: sendTo,
      });
    } catch (error :any) {
      socket.emit("custom_error", {
        message: error?.message || "Something went wrong",
      });
    }
  };
}

export default new ChatService();
