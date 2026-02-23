import productSer from "../models/product.js";

export const create = async (data) => {
  await productSer.create({
    name: data.name,
    price: data.price,
    inStock: data.inStock,
    category: data.categoryID,
  });
};
export const getAll = async () => {
  let products = await productSer.find().populate("category");
  return products;
};
export const getByID = async (id) => {
  let product = await productSer.findById(id).populate("category");
  return product;
};
