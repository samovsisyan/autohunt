import "server-only";
import { db } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "@/server/validation/auth";

let dummy: Promise<string> | null = null;
const dummyHash = () => (dummy ??= hashPassword("timing-equalizer"));

export class AuthError extends Error {
  constructor(public code: "INVALID_CREDENTIALS" | "EMAIL_TAKEN") {
    super(code);
  }
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await db.user.findUnique({ where: { email: input.email } });
  // Always run bcrypt to keep timing uniform whether or not the user exists.
  const ok = await verifyPassword(input.password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok) throw new AuthError("INVALID_CREDENTIALS");
  await createSession({ sub: user.id, role: user.role, name: user.name });
  return user;
}

export async function register(input: z.infer<typeof registerSchema>, locale: "hy" | "ru" | "en") {
  const exists = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) throw new AuthError("EMAIL_TAKEN");
  const user = await db.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone || null,
      passwordHash: await hashPassword(input.password),
      role: input.accountType, // ADMIN can never be self-assigned: schema only allows CUSTOMER | CORPORATE
      companyName: input.accountType === "CORPORATE" ? input.companyName || null : null,
      locale,
    },
  });
  await createSession({ sub: user.id, role: user.role, name: user.name });
  return user;
}
