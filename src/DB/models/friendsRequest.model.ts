import { models } from "mongoose";
import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface IFriendRequest {
  createdBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type HFriendDocumnet = HydratedDocument<IFriendRequest>;

const friendSchema = new Schema<IFriendRequest>(
  {
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    sendTo: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    acceptedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const FriendModel = models.comment || model("Friend", friendSchema);
