import { getCarsByIds } from "@/server/services/car.service";
import { json, route } from "@/server/http";

/** GET /api/cars?ids=a,b,c — card data for favorites & compare (client-side lists). */
export const GET = route(async (req: Request) => {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9]{10,40}$/i.test(s));
  return json({ items: await getCarsByIds(ids) });
});
