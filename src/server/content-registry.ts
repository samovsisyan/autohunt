import "server-only";
import type { Dictionary } from "@/i18n/dictionaries";
import { defaultContact } from "@/server/services/content.service";

/** Editable content blocks shown in /admin/pages. Defaults come from the locale dictionaries. */
export const contentBlocks: { key: string; title: string; description: string; defaults: (t: Dictionary) => Record<string, unknown> }[] = [
  { key: "home.hero", title: "Homepage — hero", description: "Headline, subheadline, CTAs and the trust row.", defaults: (t) => ({ ...t.hero }) },
  { key: "home.trust", title: "Homepage — why AutoHunt", description: "Trust items and headline numbers.", defaults: (t) => ({ ...t.trust }) },
  { key: "home.faq", title: "FAQ", description: "Questions shown on the homepage and calculator page (with FAQPage schema).", defaults: () => ({ items: [{ q: "", a: "" }] }) },
  { key: "home.cta", title: "Homepage — final call to action", description: "Closing banner above the footer.", defaults: (t) => ({ ...t.cta }) },
  { key: "site.contact", title: "Contact details", description: "Phone, email, address and social links in the footer, About page and Organization schema.", defaults: () => ({ ...defaultContact }) },
];
