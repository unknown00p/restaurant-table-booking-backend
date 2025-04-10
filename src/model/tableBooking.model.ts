import mongoose from "mongoose";

const TableBookingSchema = new mongoose.Schema(
  {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: 1
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TableBooking = mongoose.model("TableBooking", TableBookingSchema);
