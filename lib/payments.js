const PROVIDER = (process.env.PAYMENT_PROVIDER || "phonepe").toLowerCase();

export function getPaymentProvider() { return PROVIDER; }

export function isPaymentConfigured() {
  if (PROVIDER === "phonepe") {
    return Boolean(process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SALT_KEY && process.env.PHONEPE_SALT_INDEX);
  }
  if (PROVIDER === "razorpay") {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }
  return false;
}

export function getPaymentStatusMessage() {
  if (!isPaymentConfigured()) {
    return "Online payment is not configured yet. Your enrollment remains pending until payment is completed.";
  }
  return `Payment provider ${PROVIDER} is configured and ready for checkout integration.`;
}
