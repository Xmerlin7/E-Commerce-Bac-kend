import { Router } from "express";
import {
  login,
  register,
  getUser,
  logout,
  refresh,
} from "../controllers/account.controller.js";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import validate from "../middlewares/validations/validatorHandler.js";
import {
  loginValidator,
  registerValidator,
  refreshValidator,
  logoutValidator,
} from "../middlewares/validations/account.validators.js";
const router = Router();

router.route("/login").post(loginValidator, validate, login);
router.route("/register").post(registerValidator, validate, register);
router.post("/logout", authenticate, logoutValidator, validate, logout);
router.post("/refresh", refreshValidator, validate, refresh);
router.get("/me", authenticate, getUser);
export default router;
