import mongoose from "mongoose";

const BookingCancelationSchema = new mongoose.Schema(
  {
    canceledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BookingCancelation = mongoose.model("BookingCancelation",BookingCancelationSchema) 