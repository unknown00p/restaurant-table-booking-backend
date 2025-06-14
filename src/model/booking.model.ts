import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

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

    phone: {
      type: Number,
      required: true,
    },

    SpecialOccasion: {
      type: String,
    },

    AccessibilityNeeds: {
      type: String,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    reservationStartDateTime: {
      type: Date,
      required: true,
    },

    reservationEndDateTime: {
      type: Date,
      required: true,
    },

    partySize: {
      type: Number,
      required: true,
    },

    reservationStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    specialRequest: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", BookingSchema);
