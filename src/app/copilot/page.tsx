"use client";

import AppShell from "@/components/AppShell";
import CopilotChat from "@/components/copilot/CopilotChat";

export default function CopilotPage() {
  return (
    <AppShell
      title="FinWise Copilot"
      description="Finansal snapshot verilerinize göre doğal dilli analiz ve öneriler üretir."
    >
      <CopilotChat />
    </AppShell>
  );
}
