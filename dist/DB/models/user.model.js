"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.RoleEnum = exports.GenderEnum = void 0;
const mongoose_1 = require("mongoose");
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["MALE"] = "MALE";
    GenderEnum["FEMALE"] = "FEMAL";
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
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstname, lastname] = value.split(" ") || [];
    this.set({ firstname, lastname });
})
    .get(function () {
    return `${this.firstname} ${this.lastname}`;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
