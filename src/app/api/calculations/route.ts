import { saveCalculation } from "@/server/calculator/calculator.service";
import { EstimateError } from "@/server/calculator/engine";
import { saveCalculationSchema } from "@/server/validation/calculator";
import { getSession } from "@/server/auth/session";
import { clientIp, errorResponse, json, rateLimit, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  if (!rateLimit(`calc:${clientIp(req)}`, 20)) return errorResponse(429, "RATE_LIMITED");
  const { input, label } = saveCalculationSchema.parse(await req.json());
  const session = await getSession();
  try {
    const saved = await saveCalculation(input, session?.sub ?? null, label);
    return json({ shareId: saved.shareId, owned: !!session }, { status: 201 });
  } catch (e) {
    if (e instanceof EstimateError) return errorResponse(422, e.code);
    throw e;
  }
});
