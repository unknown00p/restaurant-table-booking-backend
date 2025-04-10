import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },

    reservationDateTime: {
        type: Date,
        required: true
    },

    reservationStatus: {
        type: String,
        enum: ["pending","confirmed","cancled"],
        default: "pending"
    },

    reservationEnd: {
        type: Date,
        required: true
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking",BookingSchema)