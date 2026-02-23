import { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      ref: "User",
      type: Schema.Types.ObjectId,
      required: [true, "User is required"],
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true },
);

export default model("Cart", cartSchema);
