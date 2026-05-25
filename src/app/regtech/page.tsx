import AppShell from "@/components/AppShell";

export default function RegtechPage() {
  return (
    <AppShell
      title="RegTech"
      description="Uyum ve islem takibi modulu asamali olarak gelistirilecektir."
    >
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-base font-semibold text-white">Yakinda Gelistirilecek</h3>
        <p className="mt-2 text-sm text-slate-300">
          RegTech islem takibi ve alarm yonetimi modulu Sprint 3 kapsaminda devreye alinacaktir.
        </p>
      </article>
    </AppShell>
  );
}
