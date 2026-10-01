import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { ContactInfo } from "@/server/services/content.service";
import { Logo } from "./logo";

export function Footer({ locale, t, contact }: { locale: Locale; t: Dictionary; contact: ContactInfo }) {
  const cols = [
    {
      title: t.footer.services,
      links: [
        { href: "/cars", label: t.nav.cars },
        { href: "/rent", label: t.nav.rent },
        { href: "/import", label: t.nav.import },
        { href: "/calculator", label: t.nav.calculator },
        { href: "/corporate", label: t.nav.corporate },
      ],
    },
    {
      title: t.footer.company,
      links: [
        { href: "/about", label: t.nav.about },
        { href: "/app", label: t.nav.app },
        { href: "/blog", label: t.nav.blog },
        { href: "/login", label: t.nav.login },
      ],
    },
    {
      title: t.footer.resources,
      links: [
        { href: "/favorites", label: t.nav.saved },
        { href: "/compare", label: t.nav.compare },
        { href: "/blog?category=CUSTOMS", label: t.blog.categories.CUSTOMS },
        { href: "/blog?category=AUCTIONS", label: t.blog.categories.AUCTIONS },
      ],
    },
  ];

  return (
    <footer className="defer-render relative border-t border-line bg-surface pb-24 md:pb-0">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:gap-20">
        <div>
          <Link href={href(locale)} aria-label="AutoHunt">
            <Logo />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{t.footer.about}</p>
          <ul className="mt-8 space-y-3 text-sm text-muted">
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 hover:text-fg">
                <Phone className="size-4 text-subtle" /> {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-3 hover:text-fg">
                <Mail className="size-4 text-subtle" /> {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="size-4 shrink-0 text-subtle" /> {contact.address}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-subtle" /> {contact.hours}
            </li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium tracking-[0.16em] text-subtle uppercase">{col.title}</h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={href(locale, l.href)} className="text-sm text-muted transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AutoHunt · {t.footer.address}. {t.footer.rights}
          </p>
          <div className="flex gap-5">
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
                Instagram
              </a>
            )}
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
                Facebook
              </a>
            )}
            {contact.whatsapp && (
              <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-fg">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
