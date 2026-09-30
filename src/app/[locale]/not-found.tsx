import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

// Rendered for notFound() inside [locale]; copy is trilingual because params are not available here.
export default function NotFound() {
  return (
    <section className="container-page flex min-h-[80dvh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-7xl font-semibold text-accent/80">404</p>
      <h1 className="mt-6 font-display text-3xl font-semibold">Էջը չի գտնվել · Страница не найдена · Page not found</h1>
      <p className="mt-3 max-w-md text-muted">The road you are looking for leads nowhere.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/hy" className={buttonClasses("primary")}>Գլխավոր</Link>
        <Link href="/ru" className={buttonClasses("outline")}>Главная</Link>
        <Link href="/en" className={buttonClasses("outline")}>Home</Link>
      </div>
    </section>
  );
}
