import ApiError from "../utils/ApiError.js";
import {
  createIntention,
  buildUnifiedCheckoutUrl,
  createPendingPayment,
  verifyWebhookSignature,
  processWebhookEvent,
  getPaymentStatusForUser,
  processVerifiedReturnTransaction,
  listPaymentsForUser,
} from "../services/payment.service.js";
import { clear as clearCart } from "../services/cart.service.js";

const extractUserId = (user) => {
  if (!user) return null;
  const candidate = user.userId ?? user._id ?? user.id;
  if (!candidate) return null;
  if (typeof candidate === "string") return candidate;
  if (typeof candidate?.$oid === "string") return candidate.$oid;
  if (typeof candidate?.toString === "function") {
    const asString = candidate.toString();
    if (asString && asString !== "[object Object]") return asString;
  }
  return null;
};

export const createPaymobCheckout = async (req, res, next) => {
  try {
    //Vulnerable to Price Manipulation
    //TODO: Let the server do the math
    const amountCents = Number(req.body?.amountCents);
    const currency = (req.body?.currency || "EGP").toUpperCase();
    const paymentMethods = req.body?.payment_methods;
    const billingData = req.body?.billing_data;

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new ApiError("amountCents must be a positive integer", 400);
    }
    if (
      paymentMethods != null &&
      (!Array.isArray(paymentMethods) || paymentMethods.length === 0)
    ) {
      throw new ApiError(
        "payment_methods must be a non-empty array when provided",
        400,
      );
    }
    if (!billingData || typeof billingData !== "object") {
      throw new ApiError("billing_data is required", 400);
    }
    const requiredBillingFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
    ];
    for (const field of requiredBillingFields) {
      if (
        typeof billingData[field] !== "string" ||
        !billingData[field].trim()
      ) {
        throw new ApiError(`billing_data.${field} is required`, 400);
      }
    }

    const currentUserId = extractUserId(req.user);
    if (!currentUserId) {
      throw new ApiError("Authenticated user is required", 401);
    }

    const merchantOrderId = `sw-${Date.now()}-${currentUserId || "guest"}`;
    const intention = await createIntention({
      amountCents,
      currency,
      paymentMethods,
      billingData: {
        first_name: billingData.first_name.trim(),
        last_name: billingData.last_name.trim(),
        email: billingData.email.trim(),
        phone_number: billingData.phone_number.trim(),
      },
      merchantOrderId,
    });

    await createPendingPayment({
      userId: currentUserId,
      amountCents,
      currency,
      merchantOrderId,
      providerOrderId: intention.providerOrderId,
    });

    const checkoutUrl = buildUnifiedCheckoutUrl(intention.clientSecret);
    return res.status(201).json({
      message: "Checkout URL created",
      clientSecret: intention.clientSecret,
      checkoutUrl,
      merchantOrderId,
    });
  } catch (error) {
    next(error);
  }
};

export const paymobWebhook = async (req, res, next) => {
  try {
    const signatureHeader =
      req.headers["x-paymob-signature"] || req.headers["x-paymob-hmac"];
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    if (!verifyWebhookSignature({ rawBody: req.rawBody, signature })) {
      console.warn("Rejected payment webhook due to invalid signature", {
        ip: req.ip,
        path: req.originalUrl,
      });
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    const result = await processWebhookEvent(req.body);

    if (result.paid) {
      await clearCart(result.payment.user);
      return res.status(200).json({ message: "Payment confirmed" });
    }

    if (result.alreadyProcessed) {
      return res.status(200).json({ message: "Payment already processed" });
    }

    return res.status(202).json({ message: "Payment not successful" });
  } catch (error) {
    if (error?.status === 400 || error?.status === 404) {
      console.warn("Invalid payment webhook payload", {
        message: error.message,
        ip: req.ip,
        path: req.originalUrl,
      });
    }
    next(error);
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const currentUserId = extractUserId(req.user);
    if (!currentUserId)
      throw new ApiError("Authenticated user is required", 401);

    const status = await getPaymentStatusForUser({
      userId: currentUserId,
      merchantOrderId: req.params.merchantOrderId,
    });

    return res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

export const paymobReturn = async (req, res) => {
  const frontendResultUrl = process.env.FRONTEND_PAYMENT_RESULT_URL;
  if (!frontendResultUrl) {
    return res
      .status(500)
      .json({ message: "FRONTEND_PAYMENT_RESULT_URL is missing" });
  }

  try {
    const transactionId =
      req.query?.id || req.query?.transaction_id || req.query?.txn_id || null;

    let verifiedPayment = null;
    if (transactionId) {
      try {
        verifiedPayment = await processVerifiedReturnTransaction(transactionId);
      } catch (error) {
        console.warn("Return flow provider verification failed", {
          message: error?.message,
          transactionId,
          path: req.originalUrl,
        });
      }
    }

    const queryMerchantOrderId =
      req.query?.merchantOrderId ||
      req.query?.merchant_order_id ||
      req.query?.order ||
      req.query?.merchant_order ||
      null;

    const redirectUrl = new URL(frontendResultUrl);
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) =>
          redirectUrl.searchParams.append(key, String(item)),
        );
      } else if (value != null) {
        redirectUrl.searchParams.set(key, String(value));
      }
    });
    const resolvedMerchantOrderId =
      verifiedPayment?.merchantOrderId ||
      (Array.isArray(queryMerchantOrderId)
        ? queryMerchantOrderId[0]
        : queryMerchantOrderId);

    if (resolvedMerchantOrderId) {
      redirectUrl.searchParams.set(
        "merchantOrderId",
        String(resolvedMerchantOrderId),
      );
    }

    if (verifiedPayment?.merchantOrderId) {
      redirectUrl.searchParams.set("verifiedStatus", verifiedPayment.status);
    }

    return res.redirect(302, redirectUrl.toString());
  } catch (error) {
    console.warn("Failed to build payment return redirect URL", {
      message: error?.message,
      frontendResultUrl,
    });
    return res
      .status(500)
      .json({ message: "Invalid payment return URL configuration" });
  }
};

export const listUserPayments = async (req, res, next) => {
  try {
    const currentUserId = extractUserId(req.user);
    if (!currentUserId)
      throw new ApiError("Authenticated user is required", 401);

    const data = await listPaymentsForUser({
      userId: currentUserId,
      limit: req.query?.limit,
    });

    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
};
