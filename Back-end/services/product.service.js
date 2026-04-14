import productModel from "../models/product.js";
import paginate from "../utils/pagination.util.js";
import ApiError from "../utils/ApiError.js";

export const create = async (data) => {
  const title = data.title ?? data.name;
  const category = data.category ?? data.categoryID;

  await productModel.create({
    title,
    description: data.description,
    image: data.image,
    price: data.price,
    inStock: data.inStock,
    category,
  });
};
export const getAll = async (page, limit) => {
  return await paginate({
    model: productModel,
    page,
    limit,
    populate: { path: "category", select: "name" },
  });
};
export const getByID = async (id) => {
  let product = await productModel.findById(id).populate("category");
  return product;
};
export const update = async (id, data) => {
  let updatedData = { ...data };

  if (!updatedData.category) delete updatedData.category;

  const updatedProduct = await productModel
    .findByIdAndUpdate(id, updatedData, { new: true, runValidators: true })
    .populate("category");

  if (!updatedProduct) throw new ApiError("Product not found", 404);

  return updatedProduct;
};

export const remove = async (id) => {
  const deletedProduct = await productModel.findByIdAndDelete(id);
  if (!deletedProduct) throw new ApiError("Product not found", 404);
  return deletedProduct;
};
