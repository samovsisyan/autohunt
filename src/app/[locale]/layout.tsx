import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter, Inter_Tight, Noto_Sans_Armenian } from "next/font/google";
import "../globals.css";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toast";
import { JsonLd } from "@/components/seo/json-ld";
import { ThemeScript, defaultTheme, themeColors } from "@/components/layout/theme-script";
import { getContact } from "@/server/services/content.service";
import { absoluteUrl, siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "optional" });
const interTight = Inter_Tight({ subsets: ["latin", "cyrillic"], variable: "--font-display-latin", display: "optional", weight: ["500", "600", "700"] });
const armenian = Noto_Sans_Armenian({ subsets: ["armenian"], variable: "--font-armenian", display: "optional" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}


export const viewport: Viewport = {
  themeColor: themeColors[defaultTheme],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.defaultTitle, template: `%s · AutoHunt` },
    description: t.meta.defaultDescription,
    applicationName: "AutoHunt",
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);
  const contact = await getContact(locale as Locale);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${siteUrl}/#organization`,
    name: "AutoHunt",
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl("/icon"),
    image: absoluteUrl("/images/site/hero.jpg"),
    description: t.meta.defaultDescription,
    telephone: contact.phone,
    email: contact.email,
    address: { "@type": "PostalAddress", streetAddress: contact.address, addressLocality: "Gyumri", addressCountry: "AM" },
    areaServed: { "@type": "Country", name: "Armenia" },
    sameAs: [contact.instagram, contact.facebook].filter(Boolean),
  };

  return (
    <html lang={locale} data-theme={defaultTheme} data-scroll-behavior="smooth" className={`${inter.variable} ${interTight.variable} ${armenian.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only z-[100] rounded-lg bg-fg px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <Header locale={locale} t={t.nav} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} contact={contact} />
        <Toaster />
        <JsonLd data={orgLd} />
      </body>
    </html>
  );
}
