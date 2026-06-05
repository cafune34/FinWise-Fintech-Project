"use client";

import AppShell from "@/components/AppShell";
import StateTransferPanel from "@/components/settings/StateTransferPanel";

export default function SettingsPage() {
  return (
    <AppShell
      title="Ayarlar"
      description="Yerel veri yönetimi, yedekleme ve başlangıç verilerine dönüş işlemleri buradan yönetilir."
    >
      <StateTransferPanel />
    </AppShell>
  );
}
