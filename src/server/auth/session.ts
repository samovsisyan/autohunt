import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { SESSION_COOKIE, USER_HINT_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionPayload } from "./token";

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // Non-sensitive hint so statically rendered pages can show "My account" client-side
  // without reading the httpOnly session (keeps public pages cacheable).
  (await cookies()).set(USER_HINT_COOKIE, JSON.stringify({ n: payload.name.split(" ")[0], r: payload.role }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(USER_HINT_COOKIE);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
});

/** Loads the current user from the DB (role changes/deletions take effect immediately). */
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  return db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, phone: true, role: true, locale: true, companyName: true, companyTaxId: true },
  });
});

export async function requireUser(loginPath = "/hy/login") {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return user;
}
