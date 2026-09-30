import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().max(32).optional(),
  password: z.string().min(8).max(200),
  accountType: z.enum(["CUSTOMER", "CORPORATE"]).default("CUSTOMER"),
  companyName: z.string().trim().max(160).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(32).optional(),
  companyName: z.string().trim().max(160).optional(),
  companyTaxId: z.string().trim().max(40).optional(),
  locale: z.enum(["hy", "ru", "en"]),
});
