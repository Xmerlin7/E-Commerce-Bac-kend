import * as productServices from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    await productServices.create(req.body);
    res
      .status(201)
      .json({ message: "Category Created Successfully!", data: req.body });
  } catch (err) {
    next(err);
  }
};
export const getProducts = async (req, res, next) => {
  try {
    let products = await productServices.getAll();
    res.status(201).json({ message: "Got all Successfully!", data: products });
  } catch (err) {
    next(err);
  }
};
export const getProductByID = async (req, res, next) => {
  try {
    let product = await productServices.getByID(req.params.id);
    res.status(200).json({ message: "Got it Successfully!", data: product });
  } catch (err) {
    next(err);
  }
};
