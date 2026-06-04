"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import {
  exportFinanceSnapshotAsJson,
  INVALID_FINWISE_BACKUP_MESSAGE,
  INVALID_JSON_BACKUP_MESSAGE,
  readFinanceSnapshotFromJsonFile,
} from "@/lib/stateTransfer";
import { useFinanceData } from "@/lib/useFinanceData";

export default function StateTransferPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { replaceSnapshotFromBackup, resetToSeed } = useFinanceData();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [isImporting, setIsImporting] = useState(false);

  function showPanelMessage(nextMessage: string, nextType: "success" | "error" | "info") {
    setMessage(nextMessage);
    setMessageType(nextType);
  }

  function handleExportClick() {
    try {
      exportFinanceSnapshotAsJson();
      showPanelMessage("Yedek dosyası indirilmeye hazırlandı.", "success");
    } catch {
      showPanelMessage("Yedek dosyası oluşturulamadı. Lütfen tekrar deneyin.", "error");
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setMessage(null);

    try {
      const snapshot = await readFinanceSnapshotFromJsonFile(file);
      const confirmed = window.confirm(
        "Bu işlem mevcut verilerin üzerine yazacak. Devam etmek istiyor musunuz?"
      );

      if (!confirmed) {
        showPanelMessage("Geri yükleme işlemi iptal edildi.", "info");
        return;
      }

      replaceSnapshotFromBackup(snapshot);
      showPanelMessage("Veriler başarıyla geri yüklendi.", "success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : INVALID_JSON_BACKUP_MESSAGE;
      showPanelMessage(
        errorMessage === INVALID_FINWISE_BACKUP_MESSAGE
          ? INVALID_FINWISE_BACKUP_MESSAGE
          : INVALID_JSON_BACKUP_MESSAGE,
        "error"
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  }

  function handleResetClick() {
    const confirmed = window.confirm(
      "Başlangıç verilerine dönmek mevcut yerel verilerinizi sıfırlar. Devam etmek istiyor musunuz?"
    );

    if (!confirmed) {
      return;
    }

    resetToSeed();
    showPanelMessage("Başlangıç verileri geri yüklendi.", "success");
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Snapshot</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Veri Yönetimi</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            FinWise verilerinizi JSON olarak yedekleyebilir ve daha sonra geri yükleyebilirsiniz. Bu özellik
            localStorage tabanlı snapshot mimarisinin taşınabilir olduğunu gösterir.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={handleExportClick}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <Download className="h-4 w-4" />
          Verilerimi Yedekle (.json)
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {isImporting ? "Yükleniyor..." : "Veri Yükle (.json)"}
        </button>
        <button
          type="button"
          onClick={handleResetClick}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/15"
        >
          <RotateCcw className="h-4 w-4" />
          Başlangıç Verilerine Dön
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {message ? (
        <div
          className={
            messageType === "error"
              ? "mt-5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
              : messageType === "success"
                ? "mt-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
                : "mt-5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100"
          }
        >
          {message}
        </div>
      ) : null}
    </section>
  );
}
