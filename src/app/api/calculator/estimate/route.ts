import { estimate } from "@/server/calculator/calculator.service";
import { EstimateError } from "@/server/calculator/engine";
import { estimateInputSchema } from "@/server/validation/calculator";
import { errorResponse, json, route } from "@/server/http";

export const POST = route(async (req: Request) => {
  const input = estimateInputSchema.parse(await req.json());
  try {
    return json(await estimate(input));
  } catch (e) {
    if (e instanceof EstimateError) return errorResponse(422, e.code);
    throw e;
  }
});
