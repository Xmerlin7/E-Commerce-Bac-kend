import {
  createCategory,
  getProductsByCategory,
} from "../controllers/category.controller.js";
import { Router } from "express";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import authorize from "../middlewares/auth/authorize.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import {
  createCategoryValidator,
  categoryIdParamValidator,
} from "../middlewares/validations/category.validators.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCategoryValidator,
  validate,
  createCategory,
);
router.get(
  "/:id/products",
  categoryIdParamValidator,
  validate,
  getProductsByCategory,
);
export default router;
