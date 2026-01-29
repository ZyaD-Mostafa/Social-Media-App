import { models } from "mongoose";
import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createAt?: Date;
  updateAt?: Date;
}

export interface IChat {
  //OVO --> one to one
  particiants: Types.ObjectId[];
  messages: IMessage[];

  // OVM ---> groups
  group?: string;
  group_image?: string;
  roomId?: string;

  //common between OVM & OVO
  createdBy: Types.ObjectId;

  createAt: Date;
  updateAt?: Date;
}

export type HChatDocumnet = HydratedDocument<IChat>;
export type HMessageDocumnet = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxLength: 10000,
      minLength: 2,
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
const chatSchema = new Schema<IChat>(
  {
    particiants: { types: Types.ObjectId, required: true, ref: "User" },
     createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },

    group :String , 
    group_image : String , 
    roomId :{
        type: String,
        required :function(){
            return this.roomId;
        }
    },
    messages:[messageSchema],
  },
  {
    timestamps: true,
  },
);

export const ChatModel = models.chat || model("Chat", chatSchema);
