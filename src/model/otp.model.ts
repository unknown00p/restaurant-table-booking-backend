import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
  },

  otpCode: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

export const Otp = mongoose.model("Otp", OtpSchema);
