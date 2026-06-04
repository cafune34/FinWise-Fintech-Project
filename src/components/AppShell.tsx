"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Bell,
  Brain,
  ChartPie,
  CircleDollarSign,
  CreditCard,
  Gauge,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  ChevronDown,
  Calendar,
  FileText,
  Fingerprint,
  X,
} from "lucide-react";
import {
  calculateMonthlyExpense,
  calculateMonthlyIncome,
  calculateNetCashFlow,
  calculateTotalBalance,
  getCategoryExpenseTotals,
} from "@/lib/finance";
import { formatCurrencyTRY } from "@/lib/format";
import { generateRegTechAlerts } from "@/lib/regtech";
import { useFinanceData } from "@/lib/useFinanceData";
import { categoryLabels } from "@/lib/labels";
import type { TransactionCategory } from "@/types/finance";

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
  { label: "Satın Alma Gücü", href: "/purchasing-power", icon: Gauge },
  { label: "Acil Durum Fonu", href: "/emergency-fund", icon: LifeBuoy },
  { label: "Harcama DNA’sı", href: "/spending-dna", icon: Fingerprint },
  { label: "FinWise Report", href: "/financial-report", icon: FileText },
  { label: "Davranışsal Finans", href: "/behavioral-finance", icon: Brain },
  { label: "Copilot", href: "/copilot", icon: Sparkles },
  { label: "Ayarlar", href: "/settings", icon: Settings },
];

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AppShell({ title, description, children }: AppShellProps) {
  const pathname = usePathname();
  const { accounts, transactions, budgetsWithSpending, paymentOrders, resetToSeed, lastRoboResult } = useFinanceData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [activePanel, setActivePanel] = useState<"finance" | "date" | "bell" | "profile" | null>(null);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);

  const today = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const totalBalance = calculateTotalBalance(accounts);
  const netCashFlow = calculateNetCashFlow(transactions);
  const monthlyIncome = calculateMonthlyIncome(transactions);
  const monthlyExpense = calculateMonthlyExpense(transactions);

  const regtechAlerts = generateRegTechAlerts({
    transactions,
    budgets: budgetsWithSpending,
    userId: "user-1",
  });

  const highRiskAlertsCount = regtechAlerts.filter(
    (alert) => (alert.severity ?? (alert.level === "yuksek" ? "high" : "low")) === "high"
  ).length;

  const pendingPaymentsCount = (paymentOrders || []).filter((order) => order.status === "beklemede").length;
  const exceededBudgetsCount = budgetsWithSpending.filter((b) => b.spent > b.limit).length;
  const totalNotificationsCount = pendingPaymentsCount + highRiskAlertsCount + exceededBudgetsCount;

  const nakitAkisiPuan = netCashFlow > 0 ? 30 : 10;
  const bütcePuan = exceededBudgetsCount === 0 ? 25 : exceededBudgetsCount === 1 ? 18 : exceededBudgetsCount === 2 ? 12 : 5;
  const riskPuan = highRiskAlertsCount === 0 ? 20 : highRiskAlertsCount === 1 ? 12 : highRiskAlertsCount === 2 ? 6 : 0;
  const odemePuan = pendingPaymentsCount === 0 ? 15 : pendingPaymentsCount <= 2 ? 10 : 5;
  const yatirimPuan = lastRoboResult ? 10 : 5;
  const healthScore = nakitAkisiPuan + bütcePuan + riskPuan + odemePuan + yatirimPuan;

  // En çok harcanan kategori
  const categoryTotals = getCategoryExpenseTotals(transactions, new Date());
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([category, value]) => value > 0 && category !== "maas")
    .sort((a, b) => b[1] - a[1]);
  const enCokHarcananKategori = sortedCategories.length > 0 ? categoryLabels[sortedCategories[0][0] as TransactionCategory] : "Bulunmuyor";

  // En riskli kategori
  const sortedRiskCategories = [...budgetsWithSpending]
    .filter(b => b.limit > 0)
    .sort((a, b) => (b.spent / b.limit) - (a.spent / a.limit));
  const enRiskliKategori = sortedRiskCategories.length > 0 && (sortedRiskCategories[0].spent / sortedRiskCategories[0].limit) > 0.8
    ? categoryLabels[sortedRiskCategories[0].category as TransactionCategory]
    : "Bulunmuyor";

  function handleResetClick() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    resetToSeed();
    setConfirmReset(false);
  }

  const togglePanel = (panel: "finance" | "date" | "bell" | "profile") => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Click outside backdrop overlay */}
      {activePanel && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setActivePanel(null)}
        />
      )}

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

          <div className="relative mt-5 lg:mt-6">
            {/* Mobile horizontal scroll indicator (fade overlay) */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-1.5 w-12 bg-gradient-to-l from-[#0b1220]/95 to-transparent lg:hidden z-10" />
            <nav className="flex gap-1.5 overflow-x-auto pb-1.5 pr-10 lg:flex-col lg:overflow-visible lg:pr-0 scrollbar-none">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "group flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition lg:min-h-11 lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5 lg:text-sm",
                      active
                        ? "bg-cyan-300 text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.22)]"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon className={clsx("h-3.5 w-3.5 lg:h-4 lg:w-4", active ? "text-slate-950" : "text-cyan-200/80")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-[#111827]/80 p-4 lg:mt-auto">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300/15 text-sm font-semibold text-cyan-200">
                HD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Hakan Dolay</p>
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
                {confirmReset ? "Onayla ve yenile" : "Verileri Sıfırla"}
              </button>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Yerel verileri yeniler.
              </p>
              <button
                type="button"
                onClick={() => setIsPresentationModalOpen(true)}
                className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <span>🎬 Sunum Modu</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 xl:px-10 2xl:px-12">
          <header className="relative z-40 mb-7 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Kontrol Merkezi</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300 xl:max-w-5xl">{description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 relative">
                {/* 1. Aylık Finans Görünümü */}
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => togglePanel("finance")}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-300 hover:border-cyan-300/40 hover:text-white transition cursor-pointer"
                  >
                    <Search className="h-4 w-4 text-slate-500" />
                    Aylık finans görünümü
                    <ChevronDown className="h-3 w-3 text-slate-500" />
                  </button>
                   {activePanel === "finance" && (
                    <div className="absolute right-0 mt-2 w-80 z-50 rounded-xl border border-white/10 bg-[#0b1220]/95 p-5 shadow-2xl backdrop-blur-xl animate-fade-in-slide">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Mayıs 2026 Finans Özeti</h4>
                      <div className="space-y-2.5 text-xs text-slate-200">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Toplam Gelir:</span>
                          <span className="font-semibold text-emerald-300">+{formatCurrencyTRY(monthlyIncome)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Toplam Gider:</span>
                          <span className="font-semibold text-rose-300">-{formatCurrencyTRY(monthlyExpense)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Net Nakit Akışı:</span>
                          <span className={clsx("font-semibold", netCashFlow >= 0 ? "text-emerald-300" : "text-rose-300")}>
                            {formatCurrencyTRY(netCashFlow)}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">En Çok Harcanan:</span>
                          <span className="font-semibold text-white truncate max-w-[140px] text-right" title={enCokHarcananKategori}>
                            {enCokHarcananKategori}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">En Riskli Kategori:</span>
                          <span className="font-semibold text-rose-300 truncate max-w-[140px] text-right" title={enRiskliKategori}>
                            {enRiskliKategori}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Bekleyen Talimat:</span>
                          <span className={clsx("font-semibold", pendingPaymentsCount > 0 ? "text-amber-300" : "text-slate-300")}>
                            {pendingPaymentsCount} Adet
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Sağlık Skoru:</span>
                          <span className="font-bold text-cyan-300">{healthScore}/100</span>
                        </div>
                      </div>
                      <div className="mt-3.5 rounded-lg bg-white/[0.03] p-2.5 text-[10px] leading-relaxed text-slate-300 border border-white/5">
                        {netCashFlow < 0 ? (
                          <p className="text-rose-300">⚠️ Bu ay harcama baskısı yüksek görünüyor.</p>
                        ) : (
                          <p className="text-emerald-300">✓ Bu ay nakit akışı dengeli ilerliyor.</p>
                        )}
                        {exceededBudgetsCount > 0 && (
                          <p className="mt-1 text-amber-300">⚠️ Bütçe aşımı olan kategoriler takip edilmeli.</p>
                        )}
                        {highRiskAlertsCount === 0 && exceededBudgetsCount === 0 && netCashFlow >= 0 && (
                          <p className="mt-1 text-slate-400">✓ Kritik risk sinyali bulunmuyor.</p>
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setActivePanel(null)}
                        className="mt-4 block w-full rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 py-2 text-center text-xs font-semibold text-cyan-300 transition"
                      >
                        Detayları Genel Bakışta İncele
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Tarih Görünümü */}
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => togglePanel("date")}
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-slate-300 hover:border-cyan-300/40 hover:text-white transition cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 text-cyan-300" />
                    {today}
                  </button>
                  {activePanel === "date" && (
                    <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl border border-white/10 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in-slide">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Bugünün Görünümü</h4>
                      <p className="text-xs text-slate-300 leading-5">
                        Tarih: <span className="text-white font-medium">{today}</span>
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 border-t border-white/5 pt-2">
                        Finansal kontrol merkezi aktif durumda. Bugün gerçekleşen işlemler ve bildirimler anlık izleniyor.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Bildirimler */}
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => togglePanel("bell")}
                    className={clsx(
                      "grid h-10 w-10 place-items-center rounded-xl border transition relative",
                      activePanel === "bell"
                        ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                        : "border-white/10 bg-slate-950/60 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-200"
                    )}
                    aria-label="Bildirimler"
                  >
                    <Bell className="h-4 w-4" />
                    {totalNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {totalNotificationsCount}
                      </span>
                    )}
                  </button>
                  {activePanel === "bell" && (
                    <div className="absolute right-0 mt-2 w-72 z-50 rounded-xl border border-white/10 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in-slide">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Sistem Bildirimleri</h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-300">Bekleyen ödeme talimatı:</span>
                          <span className={clsx("font-semibold rounded-full px-2 py-0.5", pendingPaymentsCount > 0 ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "text-slate-400")}>
                            {pendingPaymentsCount} Adet
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-300">Yüksek riskli uyarı:</span>
                          <span className={clsx("font-semibold rounded-full px-2 py-0.5", highRiskAlertsCount > 0 ? "bg-rose-500/10 text-rose-300 border border-rose-500/20" : "text-slate-400")}>
                            {highRiskAlertsCount} Adet
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Bütçe aşımı:</span>
                          <span className={clsx("font-semibold rounded-full px-2 py-0.5", exceededBudgetsCount > 0 ? "bg-rose-500/10 text-rose-300 border border-rose-500/20" : "text-slate-400")}>
                            {exceededBudgetsCount} Kategori
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Profil */}
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => togglePanel("profile")}
                    className={clsx(
                      "grid h-10 w-10 place-items-center rounded-xl border transition",
                      activePanel === "profile"
                        ? "border-cyan-300 bg-cyan-300/10 text-cyan-300"
                        : "border-white/10 bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                    )}
                    aria-label="Profil"
                  >
                    <UserRound className="h-4 w-4" />
                  </button>
                  {activePanel === "profile" && (
                    <div className="absolute right-0 mt-2 w-64 z-50 rounded-xl border border-white/10 bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in-slide">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Kullanıcı Özeti</h4>
                      <div className="space-y-2 text-xs text-slate-200">
                        <p className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Ad Soyad:</span>
                          <span className="font-semibold text-white">Hakan Dolay</span>
                        </p>
                        <p className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Risk Profili:</span>
                          <span className="font-semibold text-emerald-300">Dengeli</span>
                        </p>
                        <p className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Plan:</span>
                          <span className="font-semibold text-cyan-300">Aktif</span>
                        </p>
                        <p className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-slate-400">Veri Depolama:</span>
                          <span className="font-semibold text-slate-300">Yerel</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-400">Son kontrol:</span>
                          <span className="font-semibold text-slate-300">Bugün</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <section className="w-full space-y-5 pb-10 animate-fade-in-slide">{children}</section>
        </main>
      </div>

      {isPresentationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e1726]/95 p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsPresentationModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              title="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              🎬 FinWise Sunum Akışı
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Jüri ve sunum esnasında FinWise karar destek süreçlerini ve projenin öne çıkan özelliklerini bu adımlarla takip edebilirsiniz.
            </p>

            <div className="space-y-3 text-xs text-slate-200 max-h-[360px] overflow-y-auto pr-1">
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">1. Genel Bakış ile Sağlık Skoru Analizi</p>
                    <p className="text-slate-400 mt-1">Dashboard üzerinde dinamik bütçe, risk ve yatırım verilerine bağlı Sağlık Skoru kırılımı incelenir.</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">2. Portföy Dağılımı (Hesaplar)</p>
                    <p className="text-slate-400 mt-1">Aktif hesap durumları, bakiyeler ve hesap pasifleştirme özellikleri gösterilir.</p>
                  </div>
                  <Link href="/accounts" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">3. Finansal Hareketler (İşlemler)</p>
                    <p className="text-slate-400 mt-1">Tüm gelir-gider hareketleri, kategori filtreleri ve dinamik bakiye güncellemeleri yönetilir.</p>
                  </div>
                  <Link href="/transactions" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">4. Kategori Bütçe Limitleri (Bütçe Planı)</p>
                    <p className="text-slate-400 mt-1">Akıllı Kategori İçgörüleri ile limit kullanım seviyeleri takip edilir ve bütçe tahminleri izlenir.</p>
                  </div>
                  <Link href="/budget" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">5. Ödeme Güvenliği (Ödeme Talimatları)</p>
                    <p className="text-slate-400 mt-1">Canlı Ödeme Güven Skoru ile hatalı veya yetersiz bakiyeli talimat riskleri simüle edilir.</p>
                  </div>
                  <Link href="/payments" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">6. Akıllı Risk Yönetimi (Risk İzleme)</p>
                    <p className="text-slate-400 mt-1">Detaylı RegTech uyarıları, varyasyonlu sebepler ve önerilen aksiyonlar değerlendirilir.</p>
                  </div>
                  <Link href="/regtech" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-white/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">7. Robo-Advisor ile Yatırım Profili</p>
                    <p className="text-slate-400 mt-1">Skorlama anketine göre otomatik risk profili ve varlık dağılım önerileri gösterilir.</p>
                  </div>
                  <Link href="/robo-advisor" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
              <div className="rounded-lg bg-white/[0.03] p-3 border border-cyan-500/20 bg-cyan-500/5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-cyan-300">8. Finansal Aksiyon Merkezi</p>
                    <p className="text-slate-400 mt-1">Verilerden otomatik üretilen aksiyon önerileri ile karar destek ve yönlendirme akışı tamamlanır.</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setIsPresentationModalOpen(false)} className="shrink-0 rounded bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition">Bu ekrana git</Link>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPresentationModalOpen(false);
                  window.location.href = "/dashboard";
                }}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition"
              >
                Sunuma Başla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
