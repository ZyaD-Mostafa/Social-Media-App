import { model, models, Schema, Types } from "mongoose";
import { string } from "zod";

export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMAL",
}
export enum RoleEnum {
  USER = "USER",
  ADMIN = "FEMAL",
}
export interface IUser {
  _id: Types.ObjectId;
  username?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmEmilOTP: string;
  confirmedAT: Date;
  resetPasswordOTP?: string;
  phone?: string;
  addres?: string;
  gender: GenderEnum;
  role: RoleEnum;

  createdAt: Date;
  updatedAt?: Date;
}
const userSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstname, lastname] = value.split(" ") || [];
    this.set({ firstname, lastname });
  })
  .get(function () {
    return `${this.firstname} ${this.lastname}`;
  });
export const UserModel = models.User || model("User", userSchema);
