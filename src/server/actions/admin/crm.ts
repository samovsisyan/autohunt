"use server";

import { z } from "zod";
import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import { adminAction } from "./_utils";

export async function setRequestStatusAction(id: string, status: "NEW" | "IN_PROGRESS" | "QUOTED" | "CLOSED") {
  return adminAction(async () => {
    await db.request.update({ where: { id }, data: { status: z.enum(["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"]).parse(status) } });
  });
}

export async function deleteRequestAction(id: string) {
  return adminAction(async () => {
    await db.request.delete({ where: { id } });
  });
}

const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().max(32).optional(),
  role: z.enum(["CUSTOMER", "CORPORATE", "ADMIN"]),
  companyName: z.string().trim().max(160).optional(),
  password: z.string().min(8).max(200),
});

export async function createCustomerAction(input: z.input<typeof customerSchema>) {
  return adminAction(async () => {
    const d = customerSchema.parse(input);
    const user = await db.user.create({
      data: { name: d.name, email: d.email, phone: d.phone || null, role: d.role, companyName: d.companyName || null, passwordHash: await hashPassword(d.password) },
    });
    return { id: user.id };
  });
}

export async function setUserRoleAction(id: string, role: "CUSTOMER" | "CORPORATE" | "ADMIN") {
  return adminAction(async () => {
    await db.user.update({ where: { id }, data: { role: z.enum(["CUSTOMER", "CORPORATE", "ADMIN"]).parse(role) } });
  });
}
