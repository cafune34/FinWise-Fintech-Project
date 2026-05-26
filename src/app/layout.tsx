import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FinanceDataProvider } from "@/lib/useFinanceData";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinWise",
  description: "Kişisel finans yönetimi ve risk izleme paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <FinanceDataProvider>{children}</FinanceDataProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
