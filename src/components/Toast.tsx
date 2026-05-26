"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = "bg-[#0b1220]/95 border-emerald-500/30 text-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.15)]";
          let Icon = CheckCircle;

          if (toast.type === "error") {
            bgClass = "bg-[#0b1220]/95 border-rose-500/30 text-rose-200 shadow-[0_4px_20px_rgba(244,63,94,0.15)]";
            Icon = AlertCircle;
          } else if (toast.type === "info") {
            bgClass = "bg-[#0b1220]/95 border-cyan-500/30 text-cyan-200 shadow-[0_4px_20px_rgba(34,211,238,0.15)]";
            Icon = Info;
          } else if (toast.type === "warning") {
            bgClass = "bg-[#0b1220]/95 border-amber-500/30 text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.15)]";
            Icon = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border p-4 backdrop-blur-md transition-all duration-300 animate-fade-in-slide ${bgClass}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
