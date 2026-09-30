import { createRequest } from "@/server/services/request.service";
import { requestSchema } from "@/server/validation/request";
import { getSession } from "@/server/auth/session";
import { clientIp, errorResponse, json, rateLimit, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  if (!rateLimit(`req:${clientIp(req)}`, 8)) return errorResponse(429, "RATE_LIMITED");
  const body = await req.json();
  // Honeypot: bots fill hidden fields; pretend success.
  if (body?.website) return json({ ok: true }, { status: 201 });
  const input = requestSchema.parse(body);
  const session = await getSession();
  const created = await createRequest(input, session?.sub ?? null);
  return json({ ok: true, id: created.id }, { status: 201 });
});
