import { models } from "mongoose";
import { HydratedDocument, model, Schema, Types } from "mongoose";

export interface IComment {
  content: string;
  attachments: string[];

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  createdBy: Types.ObjectId;
  postId: Types.ObjectId;
  freezedBy?: Types.ObjectId;
  freezedAt?: Date;
  restoredBy?: Types.ObjectId;
  restoredAt?: Date;
  commentId?: Types.ObjectId;

  assetPostFolderId?: string;
}

export type HCommentDocumnet = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 50000,
      required: function (this: IComment) {
        return !this.attachments?.length;
      },
    },

    attachments: [String],

    commentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

export const CommentModel = models.comment || model("Comment", commentSchema);
