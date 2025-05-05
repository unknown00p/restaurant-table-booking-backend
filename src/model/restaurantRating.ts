import mongoose from "mongoose";

const restaurantRatingSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ratingNumber: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    ratingText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

restaurantRatingSchema.index({ restaurantId: 1, userId: 1 }, { unique: true });

export const RestaurantRating = mongoose.model(
  "RestaurantRating",
  restaurantRatingSchema
);
