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

    reservationStartDateTime: {
        type: Date,
        required: true
    },

    reservationEndDateTime: {
        type: Date,
        required: true
    },

    reservationStatus: {
        type: String,
        enum: ["pending","confirmed","cancled"],
        default: "pending"
    },

    specialRequest:{
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking",BookingSchema)