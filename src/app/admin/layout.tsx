import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Noto_Sans_Armenian } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toast";
import { ThemeScript, themeColors } from "@/components/layout/theme-script";
import { AdminI18nProvider } from "@/components/admin/i18n";
import { getAdminT } from "@/i18n/admin";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "optional" });
const interTight = Inter_Tight({ subsets: ["latin", "cyrillic"], variable: "--font-display-latin", display: "optional", weight: ["500", "600", "700"] });
const armenian = Noto_Sans_Armenian({ subsets: ["armenian"], variable: "--font-armenian", display: "optional" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · AutoHunt Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeColors.light },
    { media: "(prefers-color-scheme: dark)", color: themeColors.dark },
  ],
  colorScheme: "dark light",
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const { t, locale } = await getAdminT();
  return (
    <html lang={locale} data-theme="dark" data-scroll-behavior="smooth" className={`${inter.variable} ${interTight.variable} ${armenian.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        <AdminI18nProvider t={t} locale={locale}>{children}</AdminI18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
