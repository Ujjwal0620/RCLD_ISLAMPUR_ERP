export const COURSE_DISCOUNT_TYPES = ["NONE", "PERCENTAGE", "FIXED_AMOUNT"];

export const COURSE_DISCOUNT_LABELS = {
  NONE: "No discount",
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed amount",
};

export function normalizeDiscountType(value) {
  const normalized = String(value || "NONE").trim().toUpperCase().replaceAll("-", "_").replaceAll(" ", "_");
  if (normalized === "PERCENT" || normalized === "PERCENTAGE_OFF") return "PERCENTAGE";
  if (normalized === "FIXED" || normalized === "AMOUNT" || normalized === "FIXED_DISCOUNT") return "FIXED_AMOUNT";
  return COURSE_DISCOUNT_TYPES.includes(normalized) ? normalized : "NONE";
}

export function toMoneyNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(typeof value === "object" && value.toString ? value.toString() : value);
  return Number.isFinite(number) ? number : 0;
}

export function moneyToPaise(value) {
  return Math.round(toMoneyNumber(value) * 100);
}

export function paiseToMoney(paise) {
  return Math.round(Number(paise) || 0) / 100;
}

export function calculateCoursePricing(course = {}) {
  const baseFee = paiseToMoney(Math.max(0, moneyToPaise(course.standardFee)));
  const discountType = normalizeDiscountType(course.discountType);
  const discountActive = course.discountActive !== false;
  const rawDiscountValue = course.discountValue === null || course.discountValue === undefined ? null : toMoneyNumber(course.discountValue);
  const discountValue = discountType === "NONE" ? null : rawDiscountValue;

  let discountAmount = 0;

  if (discountActive && discountType === "PERCENTAGE" && discountValue !== null) {
    discountAmount = paiseToMoney(Math.round((moneyToPaise(baseFee) * discountValue) / 100));
  }

  if (discountActive && discountType === "FIXED_AMOUNT" && discountValue !== null) {
    discountAmount = paiseToMoney(Math.min(moneyToPaise(baseFee), Math.max(0, moneyToPaise(discountValue))));
  }

  const finalFee = paiseToMoney(Math.max(0, moneyToPaise(baseFee) - moneyToPaise(discountAmount)));
  const hasDiscount = discountActive && discountAmount > 0;

  return {
    baseFee,
    finalFee,
    discountType,
    discountValue,
    discountActive,
    discountAmount,
    hasDiscount,
    discountPercent: baseFee > 0 ? Math.round((discountAmount / baseFee) * 100) : 0,
  };
}

export function validateCoursePricing({ standardFee, discountType, discountValue, discountActive = true }) {
  const baseFee = toMoneyNumber(standardFee);
  const type = normalizeDiscountType(discountType);
  const value = toMoneyNumber(discountValue);

  if (baseFee < 0) return "Base course fee cannot be negative.";
  if (!Number.isFinite(baseFee)) return "Enter a valid base course fee.";

  if (type === "NONE" || !discountActive) return null;

  if (discountValue === null || discountValue === undefined || discountValue === "") {
    return "Enter a discount value or select no discount.";
  }

  if (value < 0) return "Discount cannot be negative.";

  if (type === "PERCENTAGE") {
    if (value > 100) return "Discount percentage cannot exceed 100%.";
    if (baseFee <= 0 && value > 0) return "Set a base course fee before applying a percentage discount.";
  }

  if (type === "FIXED_AMOUNT") {
    if (baseFee <= 0 && value > 0) return "Set a base course fee before applying a fixed discount.";
    if (value > baseFee) return "Fixed discount cannot exceed the base course fee.";
  }

  const pricing = calculateCoursePricing({ standardFee: baseFee, discountType: type, discountValue: value, discountActive });
  if (pricing.finalFee < 0) return "Final course fee cannot be negative.";

  return null;
}

export function serializeCourse(course) {
  if (!course) return null;
  const standardFee = course.standardFee === null || course.standardFee === undefined ? null : toMoneyNumber(course.standardFee);
  const onlineFee = course.onlineFee === null || course.onlineFee === undefined ? null : toMoneyNumber(course.onlineFee);
  const admissionFee = course.admissionFee === null || course.admissionFee === undefined ? null : toMoneyNumber(course.admissionFee);
  const discountValue = course.discountValue === null || course.discountValue === undefined ? null : toMoneyNumber(course.discountValue);
  const pricing = calculateCoursePricing({ ...course, standardFee, discountValue });

  return {
    ...course,
    standardFee,
    onlineFee,
    admissionFee,
    discountType: pricing.discountType,
    discountValue,
    discountActive: pricing.discountActive,
    pricing,
  };
}

export function normalizeSyllabus(value) {
  if (Array.isArray(value)) {
    return value
      .map((section) => {
        if (typeof section === "string") return { title: section, topics: [] };
        if (!section || typeof section !== "object") return null;
        const topics = Array.isArray(section.topics)
          ? section.topics.map((topic) => String(topic || "").trim()).filter(Boolean)
          : String(section.topics || "")
              .split(/\r?\n/)
              .map((topic) => topic.trim())
              .filter(Boolean);
        const title = String(section.title || section.name || "").trim();
        if (!title && !topics.length) return null;
        return { title: title || "Curriculum", topics };
      })
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [{ title: "Curriculum", topics: value.split(/\r?\n/).map((topic) => topic.trim()).filter(Boolean) }];
  }

  return [];
}

export function formatCourseMoney(value) {
  const amount = toMoneyNumber(value);
  return "INR " + amount.toLocaleString("en-IN", { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
}

export function formatCourseMoneyCompact(value) {
  return "₹" + toMoneyNumber(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function discountBadgeLabel(pricing) {
  if (!pricing?.hasDiscount) return "";
  if (pricing.discountType === "PERCENTAGE") return pricing.discountValue + "% OFF";
  return formatCourseMoneyCompact(pricing.discountAmount) + " OFF";
}
