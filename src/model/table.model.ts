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

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    location: {
      type: String,
      enum: ["window", "corner", "near door", "center"],
      required: true,
    },

    private: {
      type: Boolean,
      default: false,
    },

    specialFeatures: {
      type: [String],
    }
  },
  {
    timestamps: true,
  }
);

export const Table = mongoose.model("Table",TableSchema)
