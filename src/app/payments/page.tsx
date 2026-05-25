import AppShell from "@/components/AppShell";

export default function PaymentsPage() {
  return (
    <AppShell
      title="Odeme Simulasyonu"
      description="Odeme modulu Sprint 4 kapsaminda detaylandirilacaktir."
    >
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-base font-semibold text-white">Yakinda Gelistirilecek</h3>
        <p className="mt-2 text-sm text-slate-300">
          Planli odeme akislarinin detay ekranlari bir sonraki asamalarda eklenecektir.
        </p>
        <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          Not: Bu projede gercek odeme altyapisi yoktur, islevler egitim amacli simulasyon olarak kalacaktir.
        </p>
      </article>
    </AppShell>
  );
}
