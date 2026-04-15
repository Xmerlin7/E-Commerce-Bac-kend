import {
  createProduct,
  getProductByID,
  getProducts,
  updatedProduct,
  removeProduct,
} from "../controllers/product.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import authorize from "../middlewares/auth/authorize.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import productImageUpload from "../middlewares/uploads/product-image-upload.middleware.js";
import {
  createProductValidator,
  productIdParamValidator,
} from "../middlewares/validations/product.validators.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  productImageUpload.single("imageFile"),
  createProductValidator,
  validate,
  createProduct,
);
router.get("/", getProducts);
router.get("/:id", productIdParamValidator, validate, getProductByID);
router.put(
  "/:id",
  authenticate,
  productIdParamValidator,
  validate,
  authorize("admin"),
  updatedProduct,
);
router.delete(
  "/:id",
  authenticate,
  productIdParamValidator,
  validate,
  authorize("admin"),
  removeProduct,
);

export default router;
