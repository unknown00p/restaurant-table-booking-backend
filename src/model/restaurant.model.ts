import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    cuisines: {
      type: [String],
      required: true
    },

    numberOfTables: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
