import { X, FileText, Printer, CheckCircle2 } from "lucide-react";
import type { BankAccount, Transaction } from "@/types/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";
import { useEffect } from "react";

type TransactionDetailModalProps = {
  transaction: Transaction;
  account?: BankAccount;
  onClose: () => void;
};

export default function TransactionDetailModal({ transaction, account, onClose }: TransactionDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const amountClass = transaction.direction === "in" ? "text-emerald-400" : "text-rose-400";
  const amountPrefix = transaction.direction === "in" ? "+" : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1726] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 px-5 py-4">
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
        <div className="p-6">
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
        <div className="border-t border-white/10 bg-slate-900/30 px-5 py-4 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
          >
            <Printer className="h-4 w-4" />
            Yazdır / Kaydet
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
}
