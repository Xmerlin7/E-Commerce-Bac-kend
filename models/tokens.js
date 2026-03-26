import { Schema, model } from "mongoose";

const RefreshTokensSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MAGIC: Auto-deletes document when this date passes
    },
  },
  {
    timestamps: true,
  },
);
export default model("RefreshToken", RefreshTokensSchema)
