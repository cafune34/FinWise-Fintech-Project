import { Clock3, FileCheck2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import PaymentSimulationForm from "@/components/PaymentSimulationForm";

export default function PaymentsPage() {
  return (
    <AppShell
      title="Ödeme Talimatları"
      description="Alıcı, kaynak hesap ve tutar bilgisiyle takip edilebilir ödeme talimatları oluşturun."
    >
      <section className="grid w-full gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            <FileCheck2 className="h-5 w-5 text-cyan-300" />
            <h3 className="text-base font-semibold text-white">Talimat akışı</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Talimatlar referans numarasıyla kayda alınır ve durum bilgisiyle takip edilir.
          </p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-emerald-300" />
            <h3 className="text-base font-semibold text-white">Durum takibi</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Beklemede, İşleme Alındı, Tamamlandı ve Reddedildi durumlarıyla operasyonel görünüm korunur.
          </p>
        </article>
      </section>

      <PaymentSimulationForm />
    </AppShell>
  );
}
