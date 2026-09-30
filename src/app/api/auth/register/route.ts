import { register, AuthError } from "@/server/services/auth.service";
import { registerSchema } from "@/server/validation/auth";
import { isLocale } from "@/i18n/config";
import { clientIp, errorResponse, json, rateLimit, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  if (!rateLimit(`register:${clientIp(req)}`, 5)) return errorResponse(429, "RATE_LIMITED");
  const body = await req.json();
  const input = registerSchema.parse(body);
  try {
    await register(input, isLocale(body?.locale) ? body.locale : "hy");
    return json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return errorResponse(409, e.code);
    throw e;
  }
});
