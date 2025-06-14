import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    mainImage: {
      type: String,
      required: true,
    },

    subImages: { type: [String], default: [] },

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
    policies: {
      type: [
        {
          type: String,
          maxlength: 50,
        },
      ],
      validate: [arrayLimit, "{PATH} exceeds the limit of 10"],
      required: true,
    },

    perPersonPrice: {
      price: {
        type: Number,
        required: true,
      },
      minimumDeposite: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(value: string[]) {
  return value.length <= 10;
}

export const Restaurant = mongoose.model("Restaurant", RestaurantSchema);