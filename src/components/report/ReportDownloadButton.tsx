"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { generateFinancialReportPdf } from "@/lib/reportGenerator";
import type { FinanceSnapshot } from "@/lib/storage";

type ReportDownloadButtonProps = {
  snapshot: FinanceSnapshot;
  className?: string;
};

export default function ReportDownloadButton({ snapshot, className }: ReportDownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleDownload() {
    try {
      setStatus("loading");
      await generateFinancialReportPdf(snapshot);
      setStatus("success");
    } catch (error) {
      console.error("Financial report PDF could not be generated", error);
      setStatus("error");
    }
  }

  const message =
    status === "loading"
      ? "Rapor hazırlanıyor..."
      : status === "success"
        ? "PDF rapor indirildi."
        : status === "error"
          ? "Rapor oluşturulurken hata oluştu."
          : "Finansal snapshot raporu hazır.";

  return (
    <div className={clsx("space-y-3", className)}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={status === "loading"}
        className={clsx(
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
          status === "loading"
            ? "cursor-wait bg-cyan-300/70 text-slate-950"
            : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        )}
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        PDF Raporu İndir
      </button>
      <p
        className={clsx(
          "text-xs leading-5",
          status === "success"
            ? "text-emerald-300"
            : status === "error"
              ? "text-rose-300"
              : "text-slate-400"
        )}
      >
        {message}
      </p>
    </div>
  );
}
