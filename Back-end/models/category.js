import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Category name Is Required"],
    unique: [true, "Category name must be unique"],
    trim: true,
    minlength: [2, "Category name must be at least 2 chars"],
    maxlength: [50, "Category name must be at least 50 chars"],
    index: true,
  },
});

export default model("Category", categorySchema);