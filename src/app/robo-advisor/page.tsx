import AppShell from "@/components/AppShell";

export default function RoboAdvisorPage() {
  return (
    <AppShell
      title="Robo Danisman"
      description="Robo danisman arayuzu Sprint 3 ve sonrasinda kademeli olarak genisletilecektir."
    >
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-base font-semibold text-white">Yakinda Gelistirilecek</h3>
        <p className="mt-2 text-sm text-slate-300">
          Portfoy simulasyonu, dagilim onerileri ve kural tabanli yonlendirme ekranlari sonraki sprintlerde eklenecektir.
        </p>
        <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          Not: Bu uygulama gercek yatirim tavsiyesi vermez.
        </p>
      </article>
    </AppShell>
  );
}
