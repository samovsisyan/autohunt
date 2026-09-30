import { login, AuthError } from "@/server/services/auth.service";
import { loginSchema } from "@/server/validation/auth";
import { clientIp, errorResponse, json, rateLimit, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  if (!rateLimit(`login:${clientIp(req)}`, 10)) return errorResponse(429, "RATE_LIMITED");
  const input = loginSchema.parse(await req.json());
  try {
    const user = await login(input);
    return json({ ok: true, role: user.role, locale: user.locale });
  } catch (e) {
    if (e instanceof AuthError) return errorResponse(401, e.code);
    throw e;
  }
});
