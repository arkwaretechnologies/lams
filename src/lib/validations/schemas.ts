import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const athleteSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  full_name: z.string().min(1, "Full name is required"),
  rfid_tag: z.string().optional().nullable(),
  status: z.boolean(),
});

export const consumptionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  remarks: z.string().max(500, "Remarks must be 500 characters or less").optional(),
});

export const remarkTemplateSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  content: z.string().min(1, "Content is required").max(500),
  sort_order: z.coerce.number().int().min(0).default(0),
  status: z.boolean().default(true),
});

export const userSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  role_id: z.string().uuid("Select a role"),
  status: z.boolean().default(true),
  password: z.string().min(6).optional(),
});

export const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export const rfidAssignSchema = z.object({
  athlete_id: z.string().uuid(),
  rfid_tag: z.string().min(1, "RFID tag is required"),
});
