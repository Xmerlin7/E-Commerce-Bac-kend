import productModel from "../models/product.js";
import paginate from "../utils/pagination.util.js";
export const create = async (data) => {
  await productModel.create({
    name: data.name,
    price: data.price,
    inStock: data.inStock,
    category: data.categoryID,
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
