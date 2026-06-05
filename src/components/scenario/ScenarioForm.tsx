"use client";

import React, { useState } from "react";
import type { ScenarioInput, ScenarioType } from "@/lib/scenarioSimulator";
import { getScenarioTypeLabel } from "@/lib/scenarioSimulator";
import type { TransactionCategory } from "@/types/finance";
import { categoryLabels } from "@/lib/labels";
import { SlidersHorizontal, Calculator, HelpCircle } from "lucide-react";

type ScenarioFormProps = {
  onSimulate: (scenario: ScenarioInput) => void;
};

const CATEGORIES: TransactionCategory[] = [
  "market",
  "ulasim",
  "fatura",
  "egitim",
  "eglence",
  "saglik",
  "kira",
  "maas",
  "transfer",
  "yatirim",
  "diger",
];

export default function ScenarioForm({ onSimulate }: ScenarioFormProps) {
  const [type, setType] = useState<ScenarioType>("one_time_expense");
  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("diger");
  const [monthsStr, setMonthsStr] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const showMonths =
    type === "monthly_recurring_expense" ||
    type === "subscription" ||
    type === "debt_installment";

  const handlePreset = (preset: {
    type: ScenarioType;
    title: string;
    amount: number;
    category: TransactionCategory;
    months?: number;
    note?: string;
  }) => {
    setType(preset.type);
    setTitle(preset.title);
    setAmountStr(preset.amount.toString());
    setCategory(preset.category);
    setMonthsStr(preset.months ? preset.months.toString() : "");
    setNote(preset.note || "");
    setError(null);

    // Auto-trigger simulation on preset click
    const scenario: ScenarioInput = {
      type: preset.type,
      title: preset.title,
      amount: preset.amount,
      category: preset.category,
      months: preset.months,
      note: preset.note,
    };
    onSimulate(scenario);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setError("Lütfen geçerli ve 0'dan büyük bir tutar giriniz.");
      return;
    }

    let months: number | undefined = undefined;
    if (showMonths) {
      if (monthsStr.trim() !== "") {
        const parsedMonths = parseInt(monthsStr, 10);
        if (isNaN(parsedMonths) || parsedMonths < 1 || parsedMonths > 60) {
          setError("Lütfen 1 ile 60 arasında geçerli bir ay sayısı giriniz.");
          return;
        }
        months = parsedMonths;
      } else {
        // Fallbacks
        months = type === "debt_installment" ? 6 : 12;
      }
    }

    const defaultTitle = title.trim() || `${getScenarioTypeLabel(type)} Simülasyonu`;

    const scenario: ScenarioInput = {
      type,
      title: defaultTitle,
      amount,
      category,
      months,
      note: note.trim() || undefined,
    };

    onSimulate(scenario);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hızlı Şablonlar */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Hazır Örnek Senaryolar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              handlePreset({
                type: "one_time_expense",
                title: "Yeni Telefon Alımı",
                amount: 30000,
                category: "diger",
                note: "Kişisel birikimden telefon harcaması yapılması durumunda finansal durum.",
              })
            }
            className="flex items-center justify-between text-left rounded-xl border border-white/5 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
          >
            <span>📱 Yeni telefon alırsam?</span>
            <span className="font-semibold text-cyan-200">30.000 TL</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset({
                type: "rent_increase",
                title: "Kira Zammı Farkı",
                amount: 5000,
                category: "kira",
                note: "Aylık kiranın 5.000 TL artmasının bütçe ve acil durum fonuna etkisi.",
              })
            }
            className="flex items-center justify-between text-left rounded-xl border border-white/5 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
          >
            <span>🏠 Kira 5.000 TL artarsa?</span>
            <span className="font-semibold text-cyan-200">5.000 TL / ay</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset({
                type: "subscription",
                title: "Premium Yayın Abonelikleri",
                amount: 499,
                category: "eglence",
                months: 12,
                note: "Yeni eğlence aboneliklerinin 12 aylık kümülatif nakit akışı maliyeti.",
              })
            }
            className="flex items-center justify-between text-left rounded-xl border border-white/5 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
          >
            <span>🍿 Aylık 499 TL abonelik?</span>
            <span className="font-semibold text-cyan-200">499 TL / ay</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset({
                type: "extra_income",
                title: "Freelance Proje Geliri",
                amount: 10000,
                category: "maas",
                note: "Dışarıdan yapılan danışmanlık projesinin nakit akışına katkısı.",
              })
            }
            className="flex items-center justify-between text-left rounded-xl border border-white/5 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
          >
            <span>💼 10.000 TL ek gelir?</span>
            <span className="font-semibold text-emerald-300">+10.000 TL</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePreset({
                type: "debt_installment",
                title: "Beyaz Eşya Taksidi",
                amount: 3000,
                category: "diger",
                months: 6,
                note: "6 ay boyunca aylık 3.000 TL borç/taksit ödemesi eklemek.",
              })
            }
            className="sm:col-span-2 flex items-center justify-between text-left rounded-xl border border-white/5 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition"
          >
            <span>💳 6 ay vadeli taksit eklersem?</span>
            <span className="font-semibold text-cyan-200">6 ay x 3.000 TL</span>
          </button>
        </div>
      </div>

      {/* Simülasyon Formu */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
      >
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-cyan-300" />
          Senaryo Parametreleri
        </h3>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Senaryo Tipi */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Senaryo Tipi
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as ScenarioType;
                setType(newType);
                if (newType === "rent_increase") {
                  setCategory("kira");
                } else if (newType === "extra_income") {
                  setCategory("maas");
                } else if (newType === "subscription") {
                  setCategory("eglence");
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none"
            >
              <option value="one_time_expense">Tek Seferlik Harcama</option>
              <option value="monthly_recurring_expense">Aylık Tekrar Eden Gider</option>
              <option value="extra_income">Ek Gelir (Giriş)</option>
              <option value="rent_increase">Kira Artışı</option>
              <option value="subscription">Abonelik Ekleme</option>
              <option value="debt_installment">Borç/Taksit Ekleme</option>
            </select>
          </div>

          {/* Senaryo Başlığı */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Senaryo Başlığı (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Yeni Bilgisayar Alımı, Kira Zammı..."
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none placeholder-slate-500"
            />
          </div>

          {/* Tutar ve Kategori Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Tutar (TL)
              </label>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="any"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                disabled={type === "rent_increase" || type === "extra_income" || type === "subscription"}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none disabled:opacity-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Süre (Sadece belirli tipler için) */}
          {showMonths && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                Süre (Ay Sayısı)
                <span className="group relative cursor-pointer text-slate-500 hover:text-cyan-300">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-slate-950 border border-white/10 p-2 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Ödemenin devam edeceği toplam ay sayısını temsil eder.
                  </span>
                </span>
              </label>
              <input
                type="number"
                value={monthsStr}
                onChange={(e) => setMonthsStr(e.target.value)}
                placeholder={type === "debt_installment" ? "6" : "12"}
                min="1"
                max="60"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none placeholder-slate-500"
              />
            </div>
          )}

          {/* Not */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Not / Detay (İsteğe Bağlı)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Senaryo hakkında ek detaylar yazabilirsiniz..."
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 focus:border-cyan-300 focus:outline-none placeholder-slate-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-cyan-300 hover:bg-cyan-200 text-slate-950 py-3 text-sm font-semibold transition shadow-[0_12px_30px_rgba(34,211,238,0.22)]"
        >
          Senaryoyu Simüle Et
        </button>
      </form>
    </div>
  );
}
