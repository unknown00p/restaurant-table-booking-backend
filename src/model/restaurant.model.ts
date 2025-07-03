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

    mainCuisine: {
      name: { type: String, required: true },
      menu: { type: [String], required: true },
    },
    subCuisines: [
      {
        name: { type: String, required: true },
        menu: { type: [String], required: true },
      },
    ],

    expenseType: {
      type: String,
      enum: ["Low", "Medium", "High", "Expensive"],
      required: true,
    },

    executiveChef:{
      type: String,
      required:true
    },

    paymentOptions:{
      type: [String],
      required:true
    },

    dressCode: {
      type: String,
      enum: [
        "Casual",
        "Smart Casual",
        "Business Casual",
        "Formal",
      ],
      default: "Casual",
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

    minimumDeposite: {
      type: Number,
    },

    contactNo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 150,
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
