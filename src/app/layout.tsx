import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kovancılar Belediyesi · Saha Operasyon Merkezi",
  description:
    "Kovancılar Belediyesi Saha Operasyon Merkezi — Birim izole personel giriş sistemi. Operasyon Merkezi, Fen İşleri, Zabıta, Altyapı Koordinasyon ve İdari İşler panelleri.",
  keywords: [
    "Kovancılar Belediyesi",
    "Saha Operasyon Merkezi",
    "Belediye Yönetim Sistemi",
    "Birim İzolasyon",
    "Elazığ",
  ],
  authors: [{ name: "Kovancılar Belediyesi" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#0B1120" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
