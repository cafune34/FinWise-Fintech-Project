import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, ShieldCheck, WalletCards } from "lucide-react";

const moduleCards = [
  {
    title: "Hesaplar",
    description: "Bakiye, hesap tipi ve son hareketler tek görünümde izlenir.",
  },
  {
    title: "Bütçe Planı",
    description: "Kategori limitleri ve bütçe kullanımı kurumsal kartlarla takip edilir.",
  },
  {
    title: "Risk İzleme",
    description: "Öncelikli riskler ve işlem sinyalleri düzenli olarak listelenir.",
  },
  {
    title: "Yatırım Profili",
    description: "Risk profili analizi ve önerilen dağılım aynı ekranda değerlendirilir.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070b14] text-slate-100">
      <section className="relative min-h-[86vh] px-6 py-10 sm:px-10 lg:px-14 xl:px-16 2xl:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_26%),linear-gradient(135deg,#070b14_0%,#0b1220_46%,#111827_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b14] to-transparent" />

        <div className="relative z-10 grid min-h-[76vh] w-full items-center gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] 2xl:gap-14">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">FinWise</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl xl:text-7xl 2xl:text-8xl">
              Premium finans kontrol paneli
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg 2xl:text-xl">
              Hesaplarınızı, nakit akışınızı, bütçe planınızı, ödeme talimatlarınızı ve risk görünümünüzü masaüstü
              odaklı tek bir panelde yönetin.
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
                Aylık finans görünümü hazır
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Portföy özeti</p>
                    <p className="mt-2 text-4xl font-semibold text-white">156.000 TL</p>
                  </div>
                  <WalletCards className="h-9 w-9 text-cyan-300" />
                </div>
                <div className="mt-8 h-72 rounded-xl border border-white/10 bg-[#090f1d] p-5">
                  <div className="flex h-full items-end gap-3">
                    {[42, 58, 46, 68, 64, 82, 74, 88, 79, 93].map((height, index) => (
                      <div key={index} className="flex flex-1 items-end rounded-full bg-slate-800/80">
                        <div
                          className="w-full rounded-full bg-cyan-300"
                          style={{ height: `${height}%`, opacity: 0.48 + index * 0.045 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-emerald-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Nakit Akışı</p>
                      <p className="text-sm text-slate-400">Aylık net akış pozitif</p>
                    </div>
                  </div>
                  <p className="mt-5 text-2xl font-semibold text-emerald-300">+13.420 TL</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-cyan-300" />
                    <div>
                      <p className="text-sm font-semibold text-white">Öncelikli Riskler</p>
                      <p className="text-sm text-slate-400">Risk İzleme paneli aktif</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-rose-500/10 p-3 text-rose-200">Yüksek 2</div>
                    <div className="rounded-lg bg-amber-500/10 p-3 text-amber-200">Orta 5</div>
                    <div className="rounded-lg bg-cyan-500/10 p-3 text-cyan-200">Düşük 4</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
                  <p className="text-sm font-semibold text-white">Bütçe Kullanımı</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div className="h-full w-[68%] rounded-full bg-cyan-300" />
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Ana kategoriler dengeli ilerliyor.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid w-full gap-4 px-6 pb-12 sm:px-10 md:grid-cols-2 lg:px-14 xl:grid-cols-4 xl:px-16 2xl:px-20">
        {moduleCards.map((item) => (
          <article key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
