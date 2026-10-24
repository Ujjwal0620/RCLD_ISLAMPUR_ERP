import { z } from "zod";

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => (v ? v : null));

const optionalDate = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v, ctx) => {
    if (!v) return null;
    const date = new Date(v);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid date." });
      return z.NEVER;
    }
    return date;
  });

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional()
);

const imageReference = z
  .string()
  .trim()
  .max(600)
  .refine((v) => !v || v.startsWith("/uploads/registrations/") || v.startsWith("https://"), "Invalid uploaded image reference.")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

export const qualificationSchema = z.object({
  serialNo: z.coerce.number().int().min(1).max(50).optional(),
  examCourse: z.string().trim().min(1, "Examination or course is required.").max(160),
  boardUniversity: optionalText(160),
  collegeInstitute: optionalText(160),
  passingYear: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce
      .number()
      .int()
      .min(1900, "Passing year is not valid.")
      .max(new Date().getFullYear() + 2, "Passing year is not valid.")
      .optional()
  ),
  percentageMarks: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().min(0, "Percentage cannot be negative.").max(100, "Percentage cannot exceed 100.").optional()
  ),
});

export const registrationPayloadSchema = z.object({
  applicantName: z.string().trim().min(2, "Applicant name is required.").max(160),
  password: z.string().min(8, "Password must contain at least 8 characters.").max(100).optional().or(z.literal("")),
  nationality: optionalText(80),
  dateOfBirth: optionalDate,
  sex: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.enum(["MALE", "FEMALE"]).optional()),
  photoUrl: imageReference,
  guardianName: optionalText(160),
  address: optionalText(600),
  stdCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .refine((v) => !v || /^[0-9]{1,6}$/.test(v), "STD code must contain up to 6 digits."),
  telephoneNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .refine((v) => !v || /^[0-9+\-\s]{6,20}$/.test(v), "Enter a valid telephone number."),
  mobileNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .refine((v) => !v || /^[0-9+\-\s]{6,20}$/.test(v), "Enter a valid mobile number."),
  pinCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .refine((v) => !v || /^[0-9]{6}$/.test(v), "PIN code must be exactly 6 digits."),
  signatureUrl: imageReference,
  kitIssueNo: optionalText(80),
  aecCode: optionalText(80),
  registrationNo: optionalText(80),
  courseId: optionalText(80),
  demandDraftNo: optionalText(120),
  amount: optionalNumber,
  demandDraftDate: optionalDate,
  bankName: optionalText(160),
  semII: z.boolean().optional(),
  semIII: z.boolean().optional(),
  enclosureStampPhoto: z.boolean().optional(),
  enclosureQualifyingCertificates: z.boolean().optional(),
  enclosureDemandDraft: z.boolean().optional(),
  declarationAccepted: z.boolean().optional(),
  declarationDate: optionalDate,
  declarationPlace: optionalText(160),
  applicantSignatureUrl: imageReference,
  qualifications: z.array(qualificationSchema).max(15).optional(),
  submit: z.boolean().optional().default(false),
});

export const registrationUpdateSchema = registrationPayloadSchema.omit({ submit: true, password: true }).partial().extend({
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  reviewNote: z.string().trim().max(800).optional().or(z.literal("")).transform((v) => (v ? v : null)),
});

export function flattenRegistrationPayload(data) {
  const { qualifications, ...rest } = data;
  return { ...rest, qualifications: qualifications || [] };
}
