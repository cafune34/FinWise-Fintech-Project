"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useFinanceData } from "@/lib/useFinanceData";
import { formatCurrencyTRY } from "@/lib/format";

export default function FinancialCalendar() {
  const { paymentOrders } = useFinanceData();

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 14); // next 14 days

    return paymentOrders
      .filter((order) => {
        const orderDate = new Date(order.dueDate);
        return orderDate >= now && orderDate <= future && order.status === "beklemede";
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  }, [paymentOrders]);

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-300" />
            Finansal Takvim
          </h3>
          <p className="mt-1 text-xs text-slate-400">Yaklaşan ödeme emirleri (14 Gün)</p>
        </div>
      </div>

      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event) => {
            const dateObj = new Date(event.dueDate);
            const day = dateObj.getDate().toString().padStart(2, "0");
            const month = dateObj.toLocaleString("tr-TR", { month: "short" });

            return (
              <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/60 border border-white/5 hover:border-amber-300/30 transition">
                <div className="flex flex-col items-center justify-center bg-amber-500/10 text-amber-300 rounded-md w-12 h-12 shrink-0 border border-amber-500/20">
                  <span className="text-sm font-bold">{day}</span>
                  <span className="text-[10px] uppercase">{month}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{event.payee}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ödeme Talimatı</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrencyTRY(event.amount)}</p>
                  <p className="text-[10px] text-amber-400 mt-0.5">Bekliyor</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-white/10 rounded-lg">
          <CalendarDays className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">Yakın zamanda planlanmış ödeme bulunmuyor.</p>
        </div>
      )}
    </article>
  );
}
