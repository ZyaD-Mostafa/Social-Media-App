"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.AvailabilityEnum = exports.LikesUnLikesEnum = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["ALLOW"] = "ALLOW";
    AllowCommentsEnum["DENY"] = "DENY";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var LikesUnLikesEnum;
(function (LikesUnLikesEnum) {
    LikesUnLikesEnum["LIKE"] = "LIKE";
    LikesUnLikesEnum["UNLIKE"] = "UNLIKE";
})(LikesUnLikesEnum || (exports.LikesUnLikesEnum = LikesUnLikesEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["PUBLIC"] = "PUBLIC";
    AvailabilityEnum["FRIENDES"] = "FRIENDES";
    AvailabilityEnum["ONLYME"] = "ONLYME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
const postSchema = new mongoose_2.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 50000,
        required: function () {
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
exports.PostModel = mongoose_1.models.post || (0, mongoose_2.model)("Post", postSchema);
