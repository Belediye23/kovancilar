"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Belediye logosu yüklenmediyse fallback K rozetini gösteren yardımcı bileşen.
// /public/belediye-logo.png (veya .svg/.jpg) dosyasını arar, yoksa K rozeti.

const LOGO_CANDIDATES = [
  "/belediye-logo.png",
  "/belediye-logo.svg",
  "/belediye-logo.jpg",
];

type LogoStatus = "loading" | "found" | "missing";

let cachedLogoUrl: string | null = null;
let cachedStatus: LogoStatus | null = null;

export function useBelediyeLogo() {
  // Lazy init — cache varsa hemen "found" ile başla (cascading render yok)
  const [status, setStatus] = useState<LogoStatus>(() => {
    if (cachedStatus === "found" && cachedLogoUrl) return "found";
    return "loading";
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(
    cachedStatus === "found" ? cachedLogoUrl : null
  );

  useEffect(() => {
    // Cache'te varsa tekrar yükleme yapma
    if (cachedStatus === "found" && cachedLogoUrl) return;
    if (cachedStatus === "missing") return;

    let cancelled = false;
    const tryNext = (idx: number) => {
      if (cancelled) return;
      if (idx >= LOGO_CANDIDATES.length) {
        setStatus("missing");
        cachedStatus = "missing";
        return;
      }
      const url = LOGO_CANDIDATES[idx];
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setStatus("found");
        setLogoUrl(url);
        cachedStatus = "found";
        cachedLogoUrl = url;
      };
      img.onerror = () => {
        if (cancelled) return;
        tryNext(idx + 1);
      };
      img.src = url;
    };
    tryNext(0);

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, logoUrl };
}

interface BelediyeLogoProps {
  size?: number;
  className?: string;
  showBackground?: boolean;
  rounded?: "md" | "lg" | "xl" | "full";
}

export function BelediyeLogo({
  size = 80,
  className,
  showBackground = true,
  rounded = "xl",
}: BelediyeLogoProps) {
  const { status, logoUrl } = useBelediyeLogo();

  const roundedCls = {
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  if (status === "found" && logoUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden",
          showBackground && "bg-slate-900/40 border border-slate-700/40",
          roundedCls,
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={logoUrl}
          alt="Kovancılar Belediyesi arması"
          className="w-full h-full object-contain"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }

  // Fallback: K rozeti
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-blue-600/30 to-blue-700/10 border border-blue-500/30",
        roundedCls,
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        className="text-blue-300 font-bold"
        style={{ fontSize: size * 0.42 }}
      >
        K
      </span>
    </div>
  );
}

// Yukarıdaki logoyu otomatik yeniden yüklemek için component,
// logoyu kullanan bir sayfa altında gizlice render edilir.
// localStorage'daki "logo-version" değişirse cache temizlenir.
export function LogoWatcher() {
  useEffect(() => {
    const check = () => {
      const v = localStorage.getItem("logo-version") || "0";
      if (v !== LogoWatcher._lastVersion) {
        LogoWatcher._lastVersion = v;
        cachedStatus = null;
        cachedLogoUrl = null;
      }
    };
    check();
    const t = setInterval(check, 3000);
    return () => clearInterval(t);
  }, []);
  return null;
}
LogoWatcher._lastVersion = "0";
