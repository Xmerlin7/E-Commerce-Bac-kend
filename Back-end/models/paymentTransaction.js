import { Schema, model } from "mongoose";

const paymentTransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    provider: {
      type: String,
      enum: ["paymob"],
      default: "paymob",
      required: true,
    },
    merchantOrderId: {
      type: String,
      required: [true, "merchantOrderId is required"],
      unique: true,
      index: true,
    },
    providerOrderId: {
      type: String,
      default: null,
      index: true,
    },
    providerTransactionId: {
      type: String,
      default: null,
      index: true,
    },
    amountCents: {
      type: Number,
      required: [true, "amountCents is required"],
      min: [1, "amountCents must be >= 1"],
    },
    currency: {
      type: String,
      default: "EGP",
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    webhookMeta: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true },
);

export default model("PaymentTransaction", paymentTransactionSchema);
