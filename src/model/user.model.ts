import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserSchemaTypes } from '../types/user.type';

const UserSchema = new mongoose.Schema<UserSchemaTypes>(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "email is required"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
    },

    password: {
      type: String,
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["Guest","Admin","Restaurant Owner","Restaurant Staff"],
      default: "Guest"
    }
  },
  { timestamps: true }
);


UserSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 15);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {_id: this._id},
        process.env.REFRESH_TOKEN_SECRET,
        {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
);
};

UserSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {_id: this._id},
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

export const User = mongoose.model("User", UserSchema);