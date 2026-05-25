"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Hesaplar", href: "/accounts" },
  { label: "Islemler", href: "/transactions" },
  { label: "Butce", href: "/budget" },
  { label: "Odeme Simulasyonu", href: "/payments" },
  { label: "RegTech", href: "/regtech" },
  { label: "Robo Danisman", href: "/robo-advisor" },
];

type AppShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AppShell({ title, description, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-slate-800 bg-slate-900/70 p-4 backdrop-blur md:w-72 md:border-r md:border-b-0 md:p-6">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">FinWise</p>
            <h1 className="mt-1 text-xl font-semibold text-white">Sprint 2 Demo</h1>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-5 md:p-8">
          <header className="mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
          </header>

          <section className="space-y-4">{children}</section>
        </main>
      </div>
    </div>
  );
}
