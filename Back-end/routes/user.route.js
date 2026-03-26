import { Router } from "express";
import {
  getAllUsers,
  getUser,
  createOne,
} from "../controllers/user.controller.js";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import authorize from "../middlewares/auth/authorize.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import { createUserValidator } from "../middlewares/validations/user.validators.js";
const router = Router();

router
  .route("/")
  .get(authenticate, authorize("admin"), getAllUsers)
  .post(
    authenticate,
    authorize("admin"),
    createUserValidator,
    validate,
    createOne,
  );
router.get("/id", authenticate, authorize("admin"), getUser);
export default router;
