import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    image: {
      type: String,
      default:
        "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp",
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
