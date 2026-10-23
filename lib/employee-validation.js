import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().nullable();
const optionalDate = z.string().trim().optional().nullable();

const common = {
  employeeCode: z.string().trim().min(2).max(50),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(30).optional().nullable(),
  designation: optionalText,
  department: optionalText,
  employmentType: z.enum(["FULL_TIME","PART_TIME","CONTRACT","TEMPORARY","INTERN"]).default("FULL_TIME"),
  status: z.enum(["ACTIVE","INACTIVE","ON_LEAVE","RESIGNED","TERMINATED"]).default("ACTIVE"),
  joinedAt: optionalDate,
  dateOfBirth: optionalDate,
  gender: z.string().trim().max(40).optional().nullable(),
  alternatePhone: z.string().trim().max(30).optional().nullable(),
  presentAddress: optionalText,
  permanentAddress: optionalText,
  city: z.string().trim().max(100).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pinCode: z.string().trim().max(20).optional().nullable(),
  qualification: optionalText,
  skills: optionalText,
  experience: z.string().trim().max(120).optional().nullable(),
  specialization: optionalText,
  profileImageUrl: z.string().trim().max(1000).optional().nullable(),
  emergencyContactName: z.string().trim().max(120).optional().nullable(),
  emergencyContactPhone: z.string().trim().max(30).optional().nullable(),
  emergencyContactRelation: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  roleIds: z.array(z.string().min(1)).max(20).optional().default([]),
  userStatus: z.enum(["ACTIVE","INVITED","SUSPENDED","DISABLED"]).optional().default("ACTIVE"),
};

export const employeeCreateSchema = z.object({
  ...common,
  password: z.string().min(8).max(128),
});

export const employeeUpdateSchema = z.object({
  ...common,
  password: z.string().min(8).max(128).optional().or(z.literal("")),
}).partial();

export function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date.");
  return date;
}