import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    capacity: {
      type: Number,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

export const Table = mongoose.model("Table",TableSchema)
