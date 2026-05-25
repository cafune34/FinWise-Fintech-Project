import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, ShieldCheck, WalletCards } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-slate-100">
      <section className="relative min-h-[88vh] px-6 py-10 sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_26%),linear-gradient(135deg,#070b14_0%,#0b1220_46%,#111827_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b14] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">FinWise</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              Kişisel finans için premium kontrol paneli
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Hesaplarınızı, nakit akışınızı, bütçe planınızı, ödeme talimatlarınızı ve risk görünümünüzü tek bir
              profesyonel panelde takip edin.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Genel Bakışa Git
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-300">
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
                Finansal görünüm hazır
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Toplam bakiye</p>
                  <p className="mt-2 text-3xl font-semibold text-white">156.000 TL</p>
                </div>
                <WalletCards className="h-8 w-8 text-cyan-300" />
              </div>
              <div className="mt-7 h-44 rounded-xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex h-full items-end gap-3">
                  {[42, 58, 46, 68, 64, 82, 74, 88].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end rounded-full bg-slate-800/80">
                      <div
                        className="w-full rounded-full bg-cyan-300"
                        style={{ height: `${height}%`, opacity: 0.55 + index * 0.05 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Nakit Akışı</p>
                    <p className="text-sm text-slate-400">Aylık net görünüm pozitif</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">Risk İzleme</p>
                    <p className="text-sm text-slate-400">Öncelikli uyarılar sadeleştirildi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-12 sm:px-10 lg:grid-cols-3 lg:px-14">
        {["Hesaplar", "Bütçe Planı", "Yatırım Profili"].map((item) => (
          <article key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white">{item}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">FinWise içinde tek panelden yönetilen modül.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
