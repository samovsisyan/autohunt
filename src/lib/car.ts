export function carTitle(c: { year: number; brand: string; model: string; trim?: string | null }) {
  return `${c.year} ${c.brand} ${c.model}${c.trim ? ` ${c.trim}` : ""}`;
}

export function carName(c: { brand: string; model: string; trim?: string | null }) {
  return `${c.brand} ${c.model}${c.trim ? ` ${c.trim}` : ""}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Map a car body type to the calculator's shipping vehicle class. */
export function vehicleTypeForBody(body: string): string {
  if (body === "PICKUP") return "PICKUP";
  if (body === "SUV" || body === "MINIVAN") return "SUV";
  if (body === "CROSSOVER") return "CROSSOVER";
  return "SEDAN";
}
