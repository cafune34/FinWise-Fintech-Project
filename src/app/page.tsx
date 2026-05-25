import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">FinWise</p>
        <h1 className="text-4xl font-semibold leading-tight text-white">Finansal Teknolojiler Icin Egitim Odakli Demo Platformu</h1>
        <p className="text-base leading-7 text-slate-300">
          FinWise, Finansal Teknolojiler dersi kapsaminda gelistirilen bir simülasyon projesidir. Amac, temel fintech
          urun akislarini guvenli bir demo ortaminda deneyimlemektir.
        </p>
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-200">
          Not: Bu uygulama egitim amaclidir. Gercek banka baglantisi, gercek odeme ve gercek yatirim tavsiyesi
          icermez.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Dashboard&apos;a Git
        </Link>
      </div>
    </main>
  );
}
