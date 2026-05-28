import { X, FileText, Download, CheckCircle2 } from "lucide-react";
import type { BankAccount, Transaction } from "@/types/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";

type TransactionDetailModalProps = {
  transaction: Transaction;
  account?: BankAccount;
  onClose: () => void;
};

const toSafePdfText = (str: string): string => {
  return str
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C");
};

export default function TransactionDetailModal({ transaction, account, onClose }: TransactionDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, mounted]);

  if (!mounted) return null;

  const handleDownloadReceipt = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const safeTitle = toSafePdfText(transaction.title);
    const safeAmount = formatCurrencyTRY(transaction.amount);
    const safeCategory = toSafePdfText(categoryLabels[transaction.category] || transaction.category);
    const safeAccount = toSafePdfText(
      account 
        ? `${account.bankName} - ${getAccountTypeLabel(account.type)}` 
        : transaction.accountId
    );
    const safeDate = toSafePdfText(formatDateTR(transaction.occurredAt));
    const safeRef = toSafePdfText(transaction.id);
    const direction = transaction.direction;

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 50, "F");

    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(34, 211, 238); // Cyan
    doc.text("FinWise", 105, 22, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("ISLEM DEKONTU", 105, 32, { align: "center" });

    // Dashed line spacer
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineDashPattern([2, 2], 0);
    doc.line(20, 60, 190, 60);
    doc.setLineDashPattern([], 0); // reset dash

    // Transaction title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(safeTitle, 105, 75, { align: "center" });

    // Amount
    doc.setFontSize(28);
    if (direction === "in") {
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(`+${safeAmount}`, 105, 92, { align: "center" });
    } else {
      doc.setTextColor(239, 68, 68); // rose-500
      doc.text(`-${safeAmount}`, 105, 92, { align: "center" });
    }

    // Status badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.roundedRect(65, 100, 80, 8, 4, 4, "FD");
    doc.text("Islem Kaydi Tamamlandi", 105, 105.5, { align: "center" });

    // Details Grid box
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 120, 170, 60, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 120, 170, 60, "S");

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    // Row 1: Tarih
    doc.setTextColor(100, 116, 139);
    doc.text("Tarih", 25, 132);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(safeDate, 185, 132, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.line(25, 136, 185, 136);

    // Row 2: Kategori
    doc.setTextColor(100, 116, 139);
    doc.text("Kategori", 25, 146);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(safeCategory, 185, 146, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.line(25, 150, 185, 150);

    // Row 3: Kaynak Hesap
    doc.setTextColor(100, 116, 139);
    doc.text("Kaynak Hesap", 25, 160);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(safeAccount, 185, 160, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.line(25, 164, 185, 164);

    // Row 4: Referans No
    doc.setTextColor(100, 116, 139);
    doc.text("Referans Numarasi", 25, 174);
    doc.setTextColor(15, 23, 42);
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.text(safeRef, 185, 174, { align: "right" });

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Bu belge FinWise uygulamasi tarafindan uretilmistir.", 105, 260, { align: "center" });

    // Safe File Name
    let safeFileDate = "islem";
    try {
      safeFileDate = new Date(transaction.occurredAt).toISOString().split("T")[0];
    } catch {
      safeFileDate = transaction.occurredAt.replace(/[^a-zA-Z0-9-]/g, "-");
    }
    doc.save(`FinWise-Dekont-${safeFileDate}-${transaction.id}.pdf`);
  };

  const amountClass = transaction.direction === "in" ? "text-emerald-400" : "text-rose-400";
  const amountPrefix = transaction.direction === "in" ? "+" : "-";

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] grid h-dvh w-screen place-items-center bg-slate-950/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md max-h-[90dvh] overflow-hidden flex flex-col bg-[#0e1726] border border-white/10 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold">İşlem Detayı</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">{transaction.title}</h4>
            <p className={`text-3xl font-semibold tracking-tight ${amountClass}`}>
              {amountPrefix}{formatCurrencyTRY(transaction.amount)}
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              İşlem Kaydı Tamamlandı
            </p>
          </div>

          <div className="space-y-4 rounded-xl bg-slate-900/50 p-4 border border-white/5 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Tarih</span>
              <span className="text-slate-200 font-medium">{formatDateTR(transaction.occurredAt)}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Kategori</span>
              <span className="text-slate-200 font-medium">{categoryLabels[transaction.category]}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Kaynak Hesap</span>
              <span className="text-slate-200 font-medium text-right max-w-[200px] truncate">
                {account ? `${account.bankName} - ${getAccountTypeLabel(account.type)}` : transaction.accountId}
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">Referans No</span>
              <span className="text-slate-200 font-mono text-xs mt-0.5">{transaction.id}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-slate-900/30 px-5 py-4 flex gap-3 flex-shrink-0">
          <button
            onClick={handleDownloadReceipt}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
          >
            <Download className="h-4 w-4" />
            PDF Dekont İndir
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
