export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path.startsWith("/") ? "" : "/"}${path}`);
