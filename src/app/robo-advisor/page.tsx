import AppShell from "@/components/AppShell";
import { mockUser } from "@/data/mockData";

export default function RoboAdvisorPage() {
  return (
    <AppShell
      title="Robo Danisman"
      description="Robo danisman modulu icin temel arayuz iskeleti. Tavsiye algoritmasi sonraki sprintlerde eklenecektir."
    >
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-base font-semibold text-white">Kullanici Risk Profili</h3>
        <p className="mt-2 text-sm text-slate-300">{mockUser.fullName} icin tanimli profil: {mockUser.riskProfile}</p>
        <p className="mt-3 text-sm text-slate-400">
          Bu alanda Sprint 2+ asamalarinda portfoy onerisi, dagilim simulasyonu ve kural tabanli yonlendirme sunulacaktir.
        </p>
      </article>
    </AppShell>
  );
}
