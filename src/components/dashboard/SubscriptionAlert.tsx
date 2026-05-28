"use client";

import { useMemo } from "react";
import { Repeat } from "lucide-react";
import { useFinanceData } from "@/lib/useFinanceData";
import { detectSubscriptions } from "@/lib/insights";
import { formatCurrencyTRY } from "@/lib/format";

export default function SubscriptionAlert() {
  const { transactions, paymentOrders } = useFinanceData();
  const subscriptions = useMemo(() => detectSubscriptions(transactions, paymentOrders), [transactions, paymentOrders]);

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.estimatedAmount, 0);

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Repeat className="h-4 w-4 text-emerald-300" />
          Abonelik ve Düzenli Giderler
        </h3>
        <span className="text-xs font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          {subscriptions.length} Tespit
        </span>
      </div>
      
      <p className="text-xs text-slate-400 mb-3">
        Aylık tahmini düzenli ödeme yükü: <span className="font-semibold text-white">{formatCurrencyTRY(totalMonthly)}</span>
      </p>

      <div className="space-y-2">
        {subscriptions.slice(0, 3).map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-white/5">
            <span className="text-sm text-slate-200 capitalize truncate max-w-[120px]">{sub.name}</span>
            <span className="text-sm font-medium text-white">{formatCurrencyTRY(sub.estimatedAmount)}</span>
          </div>
        ))}
        {subscriptions.length > 3 && (
          <p className="text-[10px] text-center text-slate-500 mt-2">
            + {subscriptions.length - 3} diğer düzenli ödeme
          </p>
        )}
      </div>
    </article>
  );
}
