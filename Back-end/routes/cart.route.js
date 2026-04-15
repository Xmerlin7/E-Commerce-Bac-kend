import { Router } from "express";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import {
  addToCartValidator,
  cartUserIdParamValidator,
  deleteFromCartValidator,
  updateCartQuantityValidator,
} from "../middlewares/validations/cart.validators.js";
import {
  addToCart,
  getUserCart,
  deleteFromCart,
  updateCartQuantity,
} from "../controllers/cart.controller.js";
const router = new Router();
router
  .route("/user/:userId")
  .all(authenticate)
  .post(addToCartValidator, validate, addToCart)
  .patch(updateCartQuantityValidator, validate, updateCartQuantity)
  .delete(deleteFromCartValidator, validate, deleteFromCart)
  .get(cartUserIdParamValidator, validate, getUserCart);
export default router;
