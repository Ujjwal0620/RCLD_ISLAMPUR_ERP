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
  return `Payment provider ${PROVIDER} is configured. Secure checkout will be enabled after the provider integration is verified.`;
}

export function getCheckoutAvailability() {
  if (!isPaymentConfigured()) {
    return { available: false, reason: "Payment gateway credentials are not configured." };
  }
  if (PROVIDER === "phonepe") {
    return { available: false, reason: "PhonePe credentials are configured, but live checkout is locked until the current official API contract is verified." };
  }
  if (PROVIDER === "razorpay") {
    return { available: false, reason: "Razorpay checkout is not enabled yet." };
  }
  return { available: false, reason: "Unsupported payment provider." };
}
