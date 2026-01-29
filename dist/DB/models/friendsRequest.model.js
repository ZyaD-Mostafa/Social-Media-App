"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
const friendSchema = new mongoose_2.Schema({
    createdBy: {
        type: mongoose_2.Types.ObjectId,
        required: true,
        ref: "User",
    },
    sendTo: {
        type: mongoose_2.Types.ObjectId,
        required: true,
        ref: "User",
    },
    acceptedAt: Date,
}, {
    timestamps: true,
});
exports.FriendModel = mongoose_1.models.comment || (0, mongoose_2.model)("Friend", friendSchema);
