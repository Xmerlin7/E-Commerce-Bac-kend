import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/product.js";
import ApiError from "../utils/ApiError.js";
export const create = async (cat) => {
  await Category.create({ name: cat.name });
};
export const getByCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new ApiError("Invalid ID", 400);
  }
  const categoryExists = await Category.findOne({ _id: id });

  if (!categoryExists) throw new ApiError("Category not found", 400);
  const filteredProducts = await Product.find({ category: id }).populate(
    "category",
  );
  return filteredProducts;
};
