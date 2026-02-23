import cartModel from "../models/cart.js";
export const get = async (userID) => {
  let cart = await cartModel
    .findOne({ user: userID })
    .populate("products.product");
  return cart;
};
export const add = async (userId, productId, quantity = 1) => {
  if (!productId) {
    const err = new Error("productId is required");
    err.status = 400;
    throw err;
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    const err = new Error("quantity must be a number >= 1");
    err.status = 400;
    throw err;
  }

  let cart = await cartModel.findOne({ user: userId });
  if (!cart) {
    cart = await cartModel.create({
      user: userId,
      products: [{ product: productId, quantity: parsedQuantity }],
    });
    return cart;
  }

  const productIndex = cart.products.findIndex(
    (p) => p.product.toString() === productId.toString(),
  );

  if (productIndex !== -1) {
    cart.products[productIndex].quantity += parsedQuantity;
  } else {
    cart.products.push({ product: productId, quantity: parsedQuantity });
  }

  await cart.save();
  return cart;
};

export const del = async (userID, productId) => {
  if (!productId) {
    const err = new Error("productId is required");
    err.status = 400;
    throw err;
  }

  const cart = await cartModel.findOne({ user: userID });
  if (!cart) return null;

  cart.products = cart.products.filter(
    (p) => p.product.toString() !== productId,
  );

  await cart.save();
  return cart;
};
