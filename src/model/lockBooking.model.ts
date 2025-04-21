import mongoose from "mongoose";

const LockBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },

  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

LockBookingSchema.index({ tableId: 1 }, { unique: true });

export const LockBooking = mongoose.model("LockBooking", LockBookingSchema);