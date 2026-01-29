import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { BadRequestException } from "../../Utils/response/error.response";
import { generateHash } from "../../Utils/security/hash";
import { TokenModel } from "./token.model";
import { TokenRepository } from "../repository/token.repository";
import { emailEvent } from "../../Utils/events/email.event";
export enum GenderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
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
  otpExpireAt?: Date;
  profileImage?: String;
  coverImage?: String[];
  slug: String;
  changeCredintaialstime?: Date;
  freezedAt?: Date;
  friends?: Types.ObjectId[];
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
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstname, lastname] = value.split(" ") || [];
    this.set({ firstname, lastname, slug: value.replaceAll(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstname} ${this.lastname}`;
  });

// Doc middleware

userSchema.pre("validate", async function () {
  console.log("pre hook ", this);
  if (!this.slug?.includes("-")) {
    throw new BadRequestException(
      "Slug is Required and must hold - like ex : first-name=last-name",
    );
  }
});

// pre-save: hash password only
userSchema.pre(
  "save",
  async function (
    this: HUserDocumnet & { wasNew: boolean; confirmEmilPlainOTP?: string },
  ) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
      this.password = await generateHash(this.password);
    }
    if (this.isModified("confirmEmilOTP")) {
      this.confirmEmilPlainOTP = this.confirmEmilOTP as string;
      this.confirmEmilOTP = await generateHash(this.confirmEmilOTP);
    }
  },
);

// // post-save: check if document is new
userSchema.post("save", function (doc: HUserDocumnet) {
  const that = this as HUserDocumnet & {
    wasNew: boolean;
    confirmEmilPlainOTP?: string;
  };
  if (that.wasNew && that.confirmEmilPlainOTP) {
    emailEvent.emit("confirmEmil", {
      to: this.email,
      username: `${this.firstname} ${this.lastname}`,
      otp: that.confirmEmilPlainOTP,
    });
  }
});

// query middleware
// updateOne ----> query middleware
// userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
//   const update = this.getUpdate() as UpdateQuery<HUserDocumnet>;
//   if (update.freezedAt) {
//     this.setUpdate({ ...update, changeCredintaialstime: new Date() });
//   }
// });

// userSchema.post(["updateOne", "findOneAndUpdate"], async function (next) {
//   const query = this.getQuery();
//   const update = this.getUpdate() as UpdateQuery<HUserDocumnet>;

//   console.log({ query, update });

//   if (update["$set"].changeCredintaialstime) {
//     const tokenmodel = new TokenRepository(TokenModel);
//     await tokenmodel.deleteMany({ filter: { userId: query._id } });
//   }
// });

// userSchema.pre(
//   ["deleteOne", "deleteMany", "findOneAndDelete"],
//   async function (next) {
//     const query = this.getQuery();
//     const tokenmodel = new TokenRepository(TokenModel);
//     await tokenmodel.deleteMany({ filter: { userId: query._id } });
//   },
// );

// //
// userSchema.pre("insertMany", async function (docs: HUserDocumnet[]) {
//   for (const doc of docs) {
//     doc.password = await generateHash(doc.password);
//   }
// });

export const UserModel = models.User || model("User", userSchema);

export type HUserDocumnet = HydratedDocument<IUser>;
