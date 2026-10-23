import { z } from "zod";
import { COURSE_DISCOUNT_TYPES, normalizeDiscountType } from "./course-pricing.js";

const optionalText = (max) =>
  z
    .preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      z.string().trim().max(max).optional()
    )
    .transform((value) => (value ? value : null));

const optionalMoney = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().finite().nonnegative("Amount cannot be negative.").max(100000000, "Amount is too large.").optional()
);

const optionalInteger = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().min(0).max(9999).optional()
);

const optionalUrl = z
  .preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().trim().max(700).optional()
  )
  .transform((value) => (value ? value : null))
  .refine(
    (value) => !value || value.startsWith("/uploads/") || value.startsWith("/images/") || value.startsWith("https://"),
    "Enter a valid image URL."
  );

const syllabusSection = z.object({
  title: z.string().trim().min(1, "Syllabus section title is required.").max(160),
  topics: z.array(z.string().trim().min(1).max(200)).max(100).default([]),
});

export const coursePayloadSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Course code is required.")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Course code can contain letters, numbers and hyphens only.")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2, "Course name is required.").max(160),
  shortDescription: optionalText(320),
  description: optionalText(6000),
  duration: optionalText(80),
  eligibility: optionalText(400),
  standardFee: optionalMoney,
  onlineFee: optionalMoney,
  admissionFee: optionalMoney,
  discountType: z.preprocess((value) => normalizeDiscountType(value), z.enum(COURSE_DISCOUNT_TYPES)).optional(),
  discountValue: optionalMoney,
  discountActive: z.boolean().optional(),
  deliveryMode: optionalText(40),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  onlinePublished: z.boolean().optional(),
  displayOrder: optionalInteger,
  imageUrl: optionalUrl,
  bannerUrl: optionalUrl,
  features: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
  syllabus: z.array(syllabusSection).max(40).optional(),
});

export const courseUpdateSchema = coursePayloadSchema.partial();

export const DISCOUNT_FIELD_KEYS = ["discountType", "discountValue", "discountActive", "discountPercentage", "discountAmount"];

export function hasDiscountFields(body) {
  if (!body || typeof body !== "object") return false;
  return DISCOUNT_FIELD_KEYS.some((key) => Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined);
}

export function normalizeSyllabusPayload(syllabus) {
  if (!Array.isArray(syllabus)) return undefined;
  return syllabus
    .map((section) => ({
      title: String(section?.title || "").trim(),
      topics: Array.isArray(section?.topics)
        ? section.topics.map((topic) => String(topic || "").trim()).filter(Boolean)
        : [],
    }))
    .filter((section) => section.title);
}
