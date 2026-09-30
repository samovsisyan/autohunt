import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Noto_Sans_Armenian } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "optional" });
const interTight = Inter_Tight({ subsets: ["latin", "cyrillic"], variable: "--font-display-latin", display: "optional", weight: ["500", "600", "700"] });
const armenian = Noto_Sans_Armenian({ subsets: ["armenian"], variable: "--font-armenian", display: "optional" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · AutoHunt Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#07080a", colorScheme: "dark" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${interTight.variable} ${armenian.variable}`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
