import Image from "next/image";
import { Bell, CalendarClock, FileText, Gauge, Home, ShieldCheck, User, Wrench, Car } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import camry from "../../../public/images/cars/toyota-camry.jpg";

/** Pure-CSS smartphone rendering of the AutoHunt app (no screenshot asset needed). */
export function PhoneMockup({ t }: { t: Dictionary["appSection"]["mock"] }) {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[320px]" data-theme="dark" aria-hidden>
      <div className="absolute -inset-10 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative rounded-[3rem] border border-white/15 bg-[#0b0c0e] p-3 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9),inset_0_0_0_1px_rgb(255_255_255/0.04)]">
        <div className="relative overflow-hidden rounded-[2.4rem] bg-bg">
          <div className="absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="px-4 pt-11 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-subtle">{t.greeting}</p>
                <p className="font-display text-sm font-semibold">Armen</p>
              </div>
              <span className="relative grid size-8 place-items-center rounded-full bg-fg/5">
                <Bell className="size-3.5" />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" />
              </span>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-line">
              <Image src={camry} alt="" sizes="300px" className="h-28 w-full object-cover" placeholder="blur" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2.5 left-3">
                <p className="text-[10px] text-white/70">35 AH 142</p>
                <p className="font-display text-sm font-semibold">Toyota Camry SE</p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-accent/25 bg-accent-soft p-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-accent/20 text-accent">
                  <Wrench className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-[10px] text-muted">{t.nextService}</p>
                  <p className="text-xs font-medium">{t.oilChange}</p>
                </div>
                <span className="text-[10px] font-medium text-accent">{t.inDays}</span>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-fg/10">
                <div className="h-full w-[72%] rounded-full bg-accent" />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-surface p-3">
                <Gauge className="size-4 text-positive" />
                <p className="mt-2 text-[10px] text-subtle">{t.mileage}</p>
                <p className="tabular font-display text-sm font-semibold">104 380 km</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-3">
                <FileText className="size-4 text-warning" />
                <p className="mt-2 text-[10px] text-subtle">{t.documents}</p>
                <p className="font-display text-sm font-semibold">6</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-3">
              <ShieldCheck className="size-4 text-positive" />
              <div className="flex-1">
                <p className="text-xs font-medium">{t.insurance}</p>
                <p className="text-[10px] text-subtle">{t.until}</p>
              </div>
              <CalendarClock className="size-3.5 text-subtle" />
            </div>
          </div>
          <div className="flex items-center justify-around border-t border-line bg-surface/80 px-4 pt-3 pb-5 text-subtle">
            <Home className="size-4 text-fg" />
            <Car className="size-4" />
            <FileText className="size-4" />
            <User className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
