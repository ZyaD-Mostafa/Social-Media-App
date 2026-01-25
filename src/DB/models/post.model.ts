import { models } from "mongoose";
import { HydratedDocument, model, Schema, Types } from "mongoose";

export enum AllowCommentsEnum {
  ALLOW = "ALLOW",
  DENY = "DENY",
}
export enum LikesUnLikesEnum {
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}
export enum AvailabilityEnum {
  PUBLIC = "PUBLIC",
  FRIENDES = "FRIENDES",
  ONLYME = "ONLYME",
}

export interface IPost {
  content: string;
  attachments: string[];
  allowComments: AllowCommentsEnum;
  availability: AvailabilityEnum;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  freezedBy?: Types.ObjectId;
  freezedAt?: Date;
  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  assetPostFolderId?: string;
}

export type HPostDocumnet = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 50000,
      required: function (this: IPost) {
        return !this.attachments?.length;
      },
    },

    attachments: [String],
    allowComments: {
      type: String,
      enum: Object.values(AllowCommentsEnum),
      default: AllowCommentsEnum.ALLOW,
    },
    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.PUBLIC,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assetPostFolderId: String,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freezedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    freezedAt: Date,
    restoredAt: Date,
    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const PostModel = models.post || model("Post", postSchema);
