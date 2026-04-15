import ApiError from "../utils/ApiError.js";
import crypto from "crypto";
import paymentTransactionModel from "../models/paymentTransaction.js";

const DEFAULT_PAYMOB_BASE_URL = "https://accept.paymob.com/api";
const DEFAULT_PAYMOB_INTENTION_BASE_URL = "https://accept.paymob.com";
const DEFAULT_CURRENCY = "EGP";

const getBaseUrl = () => process.env.PAYMOB_BASE_URL || DEFAULT_PAYMOB_BASE_URL;
const getIntentionBaseUrl = () =>
  process.env.PAYMOB_INTENTION_BASE_URL || DEFAULT_PAYMOB_INTENTION_BASE_URL;

const parseRequiredNumber = (value, envName) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(`${envName} is missing or invalid`, 500);
  }
  return parsed;
};

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new ApiError(`${name} is missing`, 500);
  return value;
};

const getPaymobSecretLikeKey = () => {
  const secret = process.env.PAYMOB_SECRET_KEY;
  if (!secret) {
    throw new ApiError(
      "PAYMOB_SECRET_KEY is missing (required for Intention API)",
      500,
    );
  }
  return secret;
};

const parseProviderResponse = async (response, fallbackMessage) => {
  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const isJsonLike = contentType.includes("application/json");

  let data = {};
  if (raw) {
    if (isJsonLike) {
      try {
        data = JSON.parse(raw);
      } catch {
        throw new ApiError("Provider returned invalid JSON payload", 502);
      }
    } else {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      (typeof data?.raw === "string" ? data.raw.slice(0, 200) : null) ||
      fallbackMessage;
    throw new ApiError(message, 502);
  }

  return data;
};

const secureCompare = (left, right) => {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) return false;
  return crypto.timingSafeEqual(leftBuf, rightBuf);
};

const toStringId = (value) => (value == null ? null : String(value));

const normalizePaymentEvent = (payload, options = {}) => {
  const { allowMissingMerchantOrderId = false } = options;
  if (!payload || typeof payload !== "object") return null;
  const obj =
    payload.obj && typeof payload.obj === "object" ? payload.obj : payload;
  const success = obj.success === true;
  const pending = obj.pending === true;
  const amountCents = Number(obj.amount_cents ?? obj.amountCents);
  const merchantOrderId = toStringId(
    obj.order?.merchant_order_id ?? obj.merchant_order_id,
  );

  if (
    (!allowMissingMerchantOrderId && !merchantOrderId) ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0
  ) {
    return null;
  }

  return {
    success,
    pending,
    amountCents,
    merchantOrderId,
    currency: toStringId(obj.currency) || DEFAULT_CURRENCY,
    providerOrderId: toStringId(obj.order?.id ?? obj.order_id),
    providerTransactionId: toStringId(obj.id ?? obj.transaction_id),
    raw: obj,
  };
};

const paymobAuthorizedRequest = async (path, payload) => {
  const secretKey = getPaymobSecretLikeKey();
  const response = await fetch(`${getIntentionBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${secretKey}`,
    },
    body: JSON.stringify(payload),
  });
  return parseProviderResponse(response, "Paymob request failed");
};

const paymobAuthorizedGet = async (path) => {
  const secretKey = getPaymobSecretLikeKey();
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${secretKey}`,
    },
  });

  return parseProviderResponse(
    response,
    "Failed to verify transaction with provider",
  );
};

const fetchLegacyAuthToken = async () => {
  const apiKey = process.env.PAYMOB_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${getBaseUrl()}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!response.ok) return null;

  const data = await parseProviderResponse(
    response,
    "Failed to get Paymob auth token",
  );
  return data?.token || null;
};

export const createIntention = async ({
  amountCents,
  currency = DEFAULT_CURRENCY,
  paymentMethods,
  billingData,
  merchantOrderId,
}) => {
  const redirectionUrl = process.env.PAYMOB_REDIRECTION_URL?.trim();
  const safePaymentMethods =
    Array.isArray(paymentMethods) && paymentMethods.length > 0
      ? paymentMethods
      : [
          parseRequiredNumber(
            process.env.PAYMOB_INTEGRATION_ID,
            "PAYMOB_INTEGRATION_ID",
          ),
        ];

  const payload = {
    amount: amountCents,
    currency,
    payment_methods: safePaymentMethods,
    billing_data: billingData,
    extras: {
      merchant_order_id: merchantOrderId,
    },
  };

  if (redirectionUrl) {
    payload.redirection_url = redirectionUrl;
  }

  const data = await paymobAuthorizedRequest("/v1/intention/", payload);
  const clientSecret = data?.client_secret || data?.clientSecret;
  if (!clientSecret)
    throw new ApiError("Failed to create Paymob intention", 502);

  return {
    clientSecret,
    providerOrderId: toStringId(data?.id || data?.intention_id),
    raw: data,
  };
};

const getUnifiedCheckoutBaseUrl = () => {
  if (process.env.PAYMOB_UNIFIED_CHECKOUT_BASE_URL) {
    return process.env.PAYMOB_UNIFIED_CHECKOUT_BASE_URL.replace(/\/$/, "");
  }
  const publicKey = process.env.PAYMOB_PUBLIC_KEY || "";
  if (publicKey.startsWith("egy_")) {
    return "https://accept.paymob.com";
  }
  return (
    process.env.PAYMOB_PORTAL_BASE_URL || "https://portal.paymob.com"
  ).replace(/\/$/, "");
};

export const buildUnifiedCheckoutUrl = (clientSecret) => {
  if (!clientSecret) throw new ApiError("clientSecret is required", 400);
  const publicKey = requireEnv("PAYMOB_PUBLIC_KEY");
  const unifiedBase = getUnifiedCheckoutBaseUrl();
  return `${unifiedBase}/unifiedcheckout/?publicKey=${encodeURIComponent(publicKey)}&clientSecret=${encodeURIComponent(clientSecret)}`;
};

export const createPendingPayment = async ({
  userId,
  amountCents,
  currency,
  merchantOrderId,
  providerOrderId,
}) => {
  return paymentTransactionModel.create({
    user: userId,
    amountCents,
    currency,
    merchantOrderId,
    providerOrderId: toStringId(providerOrderId),
    status: "pending",
  });
};

export const verifyWebhookSignature = ({ rawBody, signature }) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) throw new ApiError("PAYMENT_WEBHOOK_SECRET is missing", 500);
  if (!rawBody || !signature) return false;
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return secureCompare(expected, signature);
};

export const verifyTransactionWithProvider = async (transactionId) => {
  if (!transactionId) throw new ApiError("transactionId is required", 400);

  const endpointTemplate =
    process.env.PAYMOB_VERIFY_TRANSACTION_ENDPOINT ||
    "/acceptance/transactions/:id";
  const path = endpointTemplate.replace(":id", String(transactionId));
  let data = null;
  try {
    data = await paymobAuthorizedGet(path);
  } catch (error) {
    // Compatibility fallback for older verify endpoints requiring temporary auth token.
    const legacyToken = await fetchLegacyAuthToken();
    if (!legacyToken) throw error;

    const separator = path.includes("?") ? "&" : "?";
    const legacyUrl = `${getBaseUrl()}${path}${separator}token=${encodeURIComponent(legacyToken)}`;
    const response = await fetch(legacyUrl, { method: "GET" });
    if (!response.ok) throw error;
    data = await parseProviderResponse(
      response,
      "Failed to verify transaction with provider",
    );
  }

  return { verified: true, data };
};

export const processWebhookEvent = async (payload) => {
  const normalized = normalizePaymentEvent(payload);
  if (!normalized) throw new ApiError("Invalid webhook payload", 400);

  const payment = await paymentTransactionModel.findOne({
    merchantOrderId: normalized.merchantOrderId,
  });

  if (!payment) throw new ApiError("Payment transaction not found", 404);

  if (payment.status === "paid") {
    return { alreadyProcessed: true, payment };
  }

  if (payment.amountCents !== normalized.amountCents) {
    throw new ApiError("Webhook amount mismatch", 400);
  }

  if (!normalized.success || normalized.pending) {
    payment.status = "failed";
    payment.providerOrderId = normalized.providerOrderId;
    payment.providerTransactionId = normalized.providerTransactionId;
    payment.webhookMeta = normalized.raw;
    await payment.save();
    return { paid: false, payment };
  }

  if (
    process.env.PAYMENT_PROVIDER_S2S_VERIFY_ENABLED === "true" &&
    normalized.providerTransactionId
  ) {
    await verifyTransactionWithProvider(normalized.providerTransactionId);
  }

  payment.status = "paid";
  payment.providerOrderId = normalized.providerOrderId;
  payment.providerTransactionId = normalized.providerTransactionId;
  payment.currency = normalized.currency || payment.currency;
  payment.paidAt = new Date();
  payment.webhookMeta = normalized.raw;
  await payment.save();
  return { paid: true, payment };
};

export const processVerifiedReturnTransaction = async (transactionId) => {
  const verification = await verifyTransactionWithProvider(transactionId);
  if (!verification?.verified)
    throw new ApiError("Provider verification failed", 502);

  const normalized = normalizePaymentEvent(verification.data, {
    allowMissingMerchantOrderId: true,
  });
  if (!normalized)
    throw new ApiError("Invalid provider verification payload", 400);

  let payment = null;
  if (normalized.merchantOrderId) {
    payment = await paymentTransactionModel.findOne({
      merchantOrderId: normalized.merchantOrderId,
    });
  }
  if (!payment && normalized.providerOrderId) {
    payment = await paymentTransactionModel.findOne({
      providerOrderId: normalized.providerOrderId,
    });
  }
  if (!payment) throw new ApiError("Payment transaction not found", 404);

  if (payment.amountCents !== normalized.amountCents) {
    throw new ApiError("Provider verification amount mismatch", 400);
  }

  if (!normalized.success || normalized.pending) {
    payment.status = "failed";
  } else {
    payment.status = "paid";
    payment.paidAt = payment.paidAt || new Date();
  }
  payment.providerOrderId =
    normalized.providerOrderId || payment.providerOrderId;
  payment.providerTransactionId =
    normalized.providerTransactionId || payment.providerTransactionId;
  payment.currency = normalized.currency || payment.currency;
  payment.webhookMeta = normalized.raw;
  await payment.save();

  return payment;
};

export const getPaymentStatusForUser = async ({ userId, merchantOrderId }) => {
  if (!merchantOrderId) throw new ApiError("merchantOrderId is required", 400);
  const payment = await paymentTransactionModel.findOne({
    user: userId,
    merchantOrderId,
  });
  if (!payment) throw new ApiError("Payment transaction not found", 404);

  return {
    merchantOrderId: payment.merchantOrderId,
    status: payment.status,
    paidAt: payment.paidAt,
    amountCents: payment.amountCents,
    currency: payment.currency,
  };
};

export const listPaymentsForUser = async ({ userId, limit = 50 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const payments = await paymentTransactionModel
    .find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .select(
      "merchantOrderId status paidAt amountCents currency createdAt updatedAt providerTransactionId",
    );

  return payments.map((payment) => ({
    id: String(payment._id),
    merchantOrderId: payment.merchantOrderId,
    status: payment.status,
    paidAt: payment.paidAt,
    amountCents: payment.amountCents,
    currency: payment.currency,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    providerTransactionId: payment.providerTransactionId,
  }));
};
