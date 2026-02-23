import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: [3, "Minimum Name length is 3 chars"],
      max: [50, "max Name length is 50 chars"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
      min: [6, "Minimum Password length is 6 chars"],
    },
  },
  {
    timestamps: true,
  },
);

export default model("User", userSchema);
