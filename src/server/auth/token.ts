import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ah_session";
export const USER_HINT_COOKIE = "ah_user";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export type Role = "ADMIN" | "CUSTOMER" | "CORPORATE";
export interface SessionPayload {
  sub: string;
  role: Role;
  name: string;
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (min 32 chars)");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: payload.role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
