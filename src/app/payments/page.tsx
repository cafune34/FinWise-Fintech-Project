import AppShell from "@/components/AppShell";
import PaymentSimulationForm from "@/components/PaymentSimulationForm";

export default function PaymentsPage() {
  return (
    <AppShell
      title="Ödeme Simülasyonu"
      description="PISP (Ödeme Emri Başlatma Hizmeti) mantığını eğitim amaçlı, güvenli bir simülasyon akışıyla deneyimleyin."
    >
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-base font-semibold text-white">PISP Nedir?</h3>
        <p className="mt-2 text-sm text-slate-300">
          PISP, kullanıcı adına ödeme emri başlatma akışını ifade eder. FinWise içinde bu akış yalnızca eğitim amacıyla,
          mock hesaplar üzerinden simüle edilir.
        </p>
        <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          Bu sayfa eğitim amaçlı ödeme emri simülasyonudur. Gerçek para transferi veya fatura ödemesi yapılmaz.
        </p>
      </article>

      <PaymentSimulationForm />
    </AppShell>
  );
}

