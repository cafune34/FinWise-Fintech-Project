import { X, FileText, Download, CheckCircle2 } from "lucide-react";
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
  }, [onClose]);

  const handleDownloadReceipt = () => {
    const amountText = `${transaction.direction === "in" ? "+" : "-"}${formatCurrencyTRY(transaction.amount)}`;
    const categoryText = categoryLabels[transaction.category] || transaction.category;
    const accountText = account 
      ? `${account.bankName} - ${getAccountTypeLabel(account.type)}` 
      : transaction.accountId;
    const dateText = formatDateTR(transaction.occurredAt);
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>FinWise İşlem Dekontu - ${transaction.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .receipt {
      width: 100%;
      max-width: 600px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #0ea5e9;
      letter-spacing: -0.025em;
      margin: 0 0 4px 0;
    }
    .title {
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
    }
    .amount-box {
      text-align: center;
      margin: 24px 0;
    }
    .amount-label {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .amount-value {
      font-size: 32px;
      font-weight: 700;
      color: ${transaction.direction === "in" ? "#10b981" : "#ef4444"};
    }
    .status-badge {
      display: inline-block;
      background-color: #ecfdf5;
      color: #047857;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-top: 8px;
    }
    .details {
      margin-top: 24px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .row:last-child {
      border-bottom: none;
    }
    .label {
      color: #64748b;
    }
    .value {
      font-weight: 600;
      color: #0f172a;
    }
    .ref-no {
      font-family: monospace;
      font-size: 12px;
    }
    .footer-note {
      text-align: center;
      margin-top: 32px;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
      }
      .receipt {
        border: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1 class="brand">FinWise</h1>
      <p class="title">İşlem Dekontu</p>
    </div>
    
    <div class="amount-box">
      <p class="amount-label">${transaction.title}</p>
      <div class="amount-value">${amountText}</div>
      <span class="status-badge">İşlem Kaydı Tamamlandı</span>
    </div>
    
    <div class="details">
      <div class="row">
        <span class="label">Tarih</span>
        <span class="value">${dateText}</span>
      </div>
      <div class="row">
        <span class="label">Kategori</span>
        <span class="value">${categoryText}</span>
      </div>
      <div class="row">
        <span class="label">Kaynak Hesap</span>
        <span class="value">${accountText}</span>
      </div>
      <div class="row">
        <span class="label">Referans Numarası</span>
        <span class="value ref-no">${transaction.id}</span>
      </div>
    </div>
    
    <div class="footer-note">
      Bu belge FinWise uygulaması tarafından üretilmiştir. Bilgilendirme amaçlıdır.
    </div>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    let safeDate = "islem";
    try {
      safeDate = new Date(transaction.occurredAt).toISOString().split("T")[0];
    } catch {
      safeDate = transaction.occurredAt.replace(/[^a-zA-Z0-9-]/g, "-");
    }
    
    a.href = url;
    a.download = `FinWise-Dekont-${safeDate}-${transaction.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const amountClass = transaction.direction === "in" ? "text-emerald-400" : "text-rose-400";
  const amountPrefix = transaction.direction === "in" ? "+" : "-";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto min-h-screen"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1726] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
            Dekontu Kaydet
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
