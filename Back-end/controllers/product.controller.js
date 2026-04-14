import * as productServices from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const image =
      req.file
        ? `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`
        : req.body.image;
    const payload = { ...req.body, image };

    await productServices.create(payload);
    res
      .status(201)
      .json({ message: "Product Created Successfully!", data: payload });
  } catch (err) {
    next(err);
  }
};
export const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await productServices.getAll(page, limit);

  res.status(200).json(result);
};
export const getProductByID = async (req, res, next) => {
  try {
    let product = await productServices.getByID(req.params.id);
    res.status(200).json({ message: "Got it Successfully!", data: product });
  } catch (err) {
    next(err);
  }
};
export const updatedProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const newProduct = req.body;
    let updatedProduct = await productServices.update(id, newProduct);
    res
      .status(200)
      .json({ message: "Updated successfully !", data: updatedProduct });
  } catch (err) {
    next(err);
  }
};
export const removeProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    await productServices.remove(id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
