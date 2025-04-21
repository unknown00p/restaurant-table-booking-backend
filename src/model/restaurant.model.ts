import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: {
      city: {
        type: String,
        required: true,
      },
      area: {
        type: String,
        required: true,
      },
    },

    cuisines: {
      type: [String],
      required: true,
    },

    numberOfTables: {
      type: Number,
      required: true,
    },
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
