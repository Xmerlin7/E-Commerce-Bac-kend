import * as categoryServices from "../services/category.service.js";

export const createCategory = async (req, res, next) => {
  try {
    const categoryID = await categoryServices.create(req.body);
    res
      .status(201)
      .json({
        message: "Category Created Successfully!",
        data: { id: categoryID, name: req.body },
      });
  } catch (err) {
    next(err);
  }
};
export const getProductsByCategory = async (req, res, next) => {
  try {
    const filteredProducts = await categoryServices.getByCategory(
      req.params.id,
    );
    return res
      .status(200)
      .json({ message: "Retrieved Successfully", data: filteredProducts });
  } catch (err) {
    next(err);
  }
};
