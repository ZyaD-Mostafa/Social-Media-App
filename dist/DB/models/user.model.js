"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
const error_response_1 = require("../../Utils/response/error.response");
const hash_1 = require("../../Utils/security/hash");
const token_model_1 = require("./token.model");
const token_repository_1 = require("../repository/token.repository");
const email_event_1 = require("../../Utils/events/email.event");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMALE";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["USER"] = "USER";
    RoleEnum["ADMIN"] = "FEMAL";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstname: {
        type: String,
        required: true,
        minLength: [3, "firstname must be 3 char long"],
        maxLength: [30, "firstname must be 30 char long"],
    },
    lastname: {
        type: String,
        required: true,
        minLength: [3, "firstname must be 3 char long"],
        maxLength: [30, "firstname must be 30 char long"],
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    confirmEmilOTP: String,
    confirmedAT: Date,
    password: { type: String, required: true },
    resetPasswordOTP: String,
    addres: String,
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE,
    },
    role: {
        type: String,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER,
    },
    coverImage: [String],
    otpExpireAt: Date,
    profileImage: String,
    changeCredintaialstime: Date,
    freezedAt: Date,
    slug: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 61,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstname, lastname] = value.split(" ") || [];
    this.set({ firstname, lastname, slug: value.replaceAll(/\s+/g, "-") });
})
    .get(function () {
    return `${this.firstname} ${this.lastname}`;
});
userSchema.pre("validate", async function () {
    console.log("pre hook ", this);
    if (!this.slug?.includes("-")) {
        throw new error_response_1.BadRequestException("Slug is Required and must hold - like ex : first-name=last-name");
    }
});
userSchema.pre("save", async function () {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
        this.password = await (0, hash_1.generateHash)(this.password);
    }
    if (this.isModified("confirmEmilOTP")) {
        this.confirmEmilPlainOTP = this.confirmEmilOTP;
        this.confirmEmilOTP = await (0, hash_1.generateHash)(this.confirmEmilOTP);
    }
});
userSchema.post("save", function (doc) {
    const that = this;
    if (that.wasNew && that.confirmEmilPlainOTP) {
        email_event_1.emailEvent.emit("confirmEmil", {
            to: this.email,
            username: `${this.firstname} ${this.lastname}`,
            otp: that.confirmEmilPlainOTP,
        });
    }
});
userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate();
    if (update.freezedAt) {
        this.setUpdate({ ...update, changeCredintaialstime: new Date() });
    }
});
userSchema.post(["updateOne", "findOneAndUpdate"], async function (next) {
    const query = this.getQuery();
    const update = this.getUpdate();
    console.log({ query, update });
    if (update["$set"].changeCredintaialstime) {
        const tokenmodel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
        await tokenmodel.deleteMany({ filter: { userId: query._id } });
    }
});
userSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], async function (next) {
    const query = this.getQuery();
    const tokenmodel = new token_repository_1.TokenRepository(token_model_1.TokenModel);
    await tokenmodel.deleteMany({ filter: { userId: query._id } });
});
userSchema.pre("insertMany", async function (docs) {
    for (const doc of docs) {
        doc.password = await (0, hash_1.generateHash)(doc.password);
    }
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
