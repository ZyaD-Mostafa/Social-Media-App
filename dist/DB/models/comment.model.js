"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const commentSchema = new mongoose_2.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    commentId: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
    likes: [
        {
            type: mongoose_2.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    tags: [
        {
            type: mongoose_2.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    assetPostFolderId: String,
    createdBy: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    freezedBy: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
    freezedAt: Date,
    restoredAt: Date,
    restoredBy: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
exports.CommentModel = mongoose_1.models.comment || (0, mongoose_2.model)("Comment", commentSchema);
