import { Router } from "express";
import authenticate from "../middlewares/auth/authenticate.middleware.js";
import {
  createPaymobCheckout,
  paymobWebhook,
  getPaymentStatus,
  paymobReturn,
  listUserPayments,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/paymob/checkout", authenticate, createPaymobCheckout);
router.post("/paymob/webhook", paymobWebhook);
router.get("/paymob/return", paymobReturn);
router.get("/paymob/orders", authenticate, listUserPayments);
router.get("/paymob/status/:merchantOrderId", authenticate, getPaymentStatus);

export default router;
