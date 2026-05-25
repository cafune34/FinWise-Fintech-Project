"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  ChartPie,
  CircleDollarSign,
  CreditCard,
  Gauge,
  Landmark,
  LayoutDashboard,
  ListChecks,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { calculateNetCashFlow, calculateTotalBalance } from "@/lib/finance";
import { formatCurrencyTRY } from "@/lib/format";
import { useFinanceData } from "@/lib/useFinanceData";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { label: "Genel Bakış", href: "/dashboard", icon: LayoutDashboard },
  { label: "Hesaplar", href: "/accounts", icon: WalletCards },
  { label: "İşlemler", href: "/transactions", icon: ListChecks },
  { label: "Bütçe Planı", href: "/budget", icon: ChartPie },
  { label: "Ödeme Talimatları", href: "/payments", icon: CreditCard },
  { label: "Risk İzleme", href: "/regtech", icon: ShieldCheck },
  { label: "Yatırım Profili", href: "/robo-advisor", icon: Gauge },
];

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AppShell({ title, description, children }: AppShellProps) {
  const pathname = usePathname();
  const { accounts, transactions, resetToSeed } = useFinanceData();
  const [confirmReset, setConfirmReset] = useState(false);
  const today = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const totalBalance = calculateTotalBalance(accounts);
  const netCashFlow = calculateNetCashFlow(transactions);

  function handleResetClick() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    resetToSeed();
    setConfirmReset(false);
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(135deg,#070b14_0%,#0c1220_48%,#111827_100%)]" />
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-[#0b1220]/95 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-80 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-6 2xl:w-[312px]">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10">
              <Landmark className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">FinWise</p>
              <h1 className="text-lg font-semibold text-white">Finans Paneli</h1>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Portföy Özeti</p>
              <CircleDollarSign className="h-4 w-4 text-cyan-300" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{formatCurrencyTRY(totalBalance)}</p>
            <p className={clsx("mt-1 text-sm", netCashFlow >= 0 ? "text-emerald-300" : "text-rose-300")}>
              Nakit akışı {netCashFlow >= 0 ? "pozitif" : "yakın takipte"}
            </p>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "group flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-cyan-300 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.22)]"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <Icon className={clsx("h-4 w-4", active ? "text-slate-950" : "text-cyan-200/80")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-xl border border-white/10 bg-[#111827]/80 p-4 lg:mt-auto">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300/15 text-sm font-semibold text-cyan-200">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Ayşe Demir</p>
                <p className="truncate text-xs text-slate-400">Hesap özeti</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-slate-400">Risk</p>
                <p className="mt-1 font-semibold text-emerald-300">Dengeli</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-slate-400">Plan</p>
                <p className="mt-1 font-semibold text-cyan-300">Aktif</p>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleResetClick}
                className={clsx(
                  "flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition",
                  confirmReset
                    ? "border-amber-300/50 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15"
                    : "border-white/10 bg-slate-950/50 text-slate-200 hover:border-cyan-300/40 hover:text-cyan-200"
                )}
              >
                <RefreshCcw className="h-4 w-4" />
                {confirmReset ? "Onayla ve yenile" : "Verileri başlangıç durumuna al"}
              </button>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Bu işlem kayıtlı yerel verileri yeniler.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-h-screen w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 xl:px-10 2xl:px-12">
          <header className="mb-7 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Kontrol Merkezi</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 xl:max-w-5xl">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-300">
                  <Search className="h-4 w-4 text-slate-500" />
                  Aylık finans görünümü
                </div>
                <div className="flex h-10 items-center rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-300">
                  {today}
                </div>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-slate-950/60 text-slate-300 transition hover:border-cyan-300/50 hover:text-cyan-200"
                  aria-label="Bildirimler"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-cyan-300 text-slate-950 transition hover:bg-cyan-200"
                  aria-label="Profil"
                >
                  <UserRound className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <section className="w-full space-y-5 pb-10">{children}</section>
        </main>
      </div>
    </div>
  );
}
