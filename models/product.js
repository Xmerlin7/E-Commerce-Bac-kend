import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price Cannot be Negative"],
    },

    inStock: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
  },
);

export default model("Product", productSchema);
