export const REGISTRATION_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

export const REGISTRATION_STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const REGISTRATION_STATUS_TONES = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

export function isGdcaCourse(course) {
  if (!course) return false;
  const code = String(course.code || "").toUpperCase().replace(/[^A-Z]/g, "");
  const name = String(course.name || "").toUpperCase().replace(/[^A-Z]/g, "");
  return code.includes("GDCA") || name.includes("GDCA");
}

export function registrationYear(date = new Date()) {
  return new Date(date).getFullYear();
}

export function generateFormNo(year = registrationYear()) {
  return `FORM-${year}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
}

export function generateRegistrationNo(year = registrationYear()) {
  return `RCLD-${year}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
}

export function formatInr(value) {
  const number = Number(value || 0);
  return "INR " + number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatDate(value, fallback = "Not provided") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
