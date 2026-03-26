import * as cartServices from "../services/cart.service.js";
import ApiError from "../utils/ApiError.js";

const assertCartAccess = (req, userId) => {
  if (!req.user) throw new ApiError("Unauthorized", 401);
  if (req.user.role === "admin") return;
  if (req.user.userId?.toString() !== userId?.toString()) {
    throw new ApiError("Forbidden", 403);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    assertCartAccess(req, req.params.userId);
    const { productId, quantity } = req.body;
    const added = await cartServices.add(
      req.params.userId,
      productId,
      quantity,
    );
    return res
      .status(201)
      .json({ Message: "create Successfully!", data: added });
  } catch (err) {
    next(err);
  }
};
export const getUserCart = async (req, res, next) => {
  try {
    assertCartAccess(req, req.params.userId);
    let cart = await cartServices.get(req.params.userId);
    return res
      .status(200)
      .json({ Message: "Retrieved Successfully!", data: cart });
  } catch (err) {
    next(err);
  }
};
export const deleteFromCart = async (req, res, next) => {
  try {
    assertCartAccess(req, req.params.userId);
    const { productId } = req.body;
    const cart = await cartServices.del(req.params.userId, productId);
    return res
      .status(200)
      .json({ Message: "Deleted Successfully!", data: cart });
  } catch (err) {
    next(err);
  }
};
