"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const messageSchema = new mongoose_2.Schema({
    content: {
        type: String,
        required: true,
        maxLength: 10000,
        minLength: 2,
    },
    createdBy: {
        type: mongoose_2.Types.ObjectId,
        required: true,
        ref: "User",
    },
}, {
    timestamps: true,
});
const chatSchema = new mongoose_2.Schema({
    particiants: { types: mongoose_2.Types.ObjectId, required: true, ref: "User" },
    createdBy: {
        type: mongoose_2.Types.ObjectId,
        required: true,
        ref: "User",
    },
    group: String,
    group_image: String,
    roomId: {
        type: String,
        required: function () {
            return this.roomId;
        }
    },
    messages: [messageSchema],
}, {
    timestamps: true,
});
exports.ChatModel = mongoose_1.models.chat || (0, mongoose_2.model)("Chat", chatSchema);
