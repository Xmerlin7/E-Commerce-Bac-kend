import {
  createProduct,
  getProductByID,
  getProducts,
} from "../controllers/product.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import authorize from "../middlewares/auth/authorize.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import {
  createProductValidator,
  productIdParamValidator,
} from "../middlewares/validations/product.validators.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createProductValidator,
  validate,
  createProduct,
);
router.get("/", getProducts);
router.get("/:id", productIdParamValidator, validate, getProductByID);
export default router;
