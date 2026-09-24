"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Command,
  HardHat,
  ShieldCheck,
  Layers,
  FileText,
  Bell,
  LogOut,
  Search,
  Activity,
  Menu,
  X,
  ShieldAlert,
  Clock,
  ChevronRight,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { getBirim } from "@/lib/auth";
import { formatTarih } from "@/lib/mock-data";
import { useOperasyonStore } from "@/lib/store";
import { useNotifications } from "@/hooks/use-notifications";
import type { BirimId, SessionUser, Bildirim } from "@/lib/types";
import { BelediyeLogo } from "@/components/shared/belediye-logo";

// Lucide ikon eşleştirme (birim ikonları)
const BIRIM_IKONLAR: Record<BirimId, React.ComponentType<{ className?: string }>> = {
  operasyon: Command,
  "fen-isleri": HardHat,
  zabita: ShieldCheck,
  altyapi: Layers,
  "idari-isler": FileText,
};

export interface SidebarItem {
  id: string;
  label: string;
  ikon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface AppShellProps {
  user: SessionUser;
  sidebarItems: SidebarItem[];
  activeModule: string;
  onModuleChange: (id: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppShell({
  user,
  sidebarItems,
  activeModule,
  onModuleChange,
  onLogout,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const birim = useMemo(() => getBirim(user.birimId), [user.birimId]);
  const BirimIcon = BIRIM_IKONLAR[user.birimId];

  // Zustand store'dan canlı bildirimler (mock-data yerine)
  const bildirimler = useOperasyonStore((s) => s.bildirimler);
  const okunmamisBildirim = bildirimler.filter((b) => !b.okundu).length;

  // Socket.io canlı bağlantı — broadcast fonksiyonunu store'a bağla
  const { connected: wsConnected, bagliClientSayisi, broadcast, markAllBildirimOkundu: markAllRead } =
    useNotifications(user);

  // Store'a broadcast fonksiyonunu set et — mutasyonlar bunu çağıracak
  const setBroadcastFn = useOperasyonStore((s) => s.setBroadcastFn);
  useEffect(() => {
    if (broadcast) {
      setBroadcastFn(broadcast);
    }
  }, [broadcast, setBroadcastFn]);

  const initials = useMemo(() => {
    return user.adSoyad
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user.adSoyad]);

  function handleLogoutClick() {
    toast({
      title: "Çıkış yapılıyor",
      description: `${user.adSoyad} — ${birim.ad} oturumu kapatıldı.`,
    });
    setTimeout(() => onLogout(), 200);
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-grid-navy relative"
      style={{ backgroundColor: "#0B1120" }}
    >
      {/* Radial ışıma */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      {/* Üst bar */}
      <header
        className="relative z-20 h-14 sm:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 border-b border-slate-800/80 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(11, 17, 32, 0.85)" }}
      >
        {/* Mobil menü tetikleyici */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800/60 h-9 w-9"
              aria-label="Menüyü aç"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-[#0F1623] border-r border-slate-800">
            <SheetTitle className="sr-only">Birim modülleri</SheetTitle>
            <SidebarLogo birim={birim} BirimIcon={BirimIcon} user={user} />
            <SidebarContent
              sidebarItems={sidebarItems}
              activeModule={activeModule}
              onModuleChange={(id) => {
                onModuleChange(id);
                setMobileOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Birim rozeti */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 items-center justify-center">
            <BirimIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-slate-500 font-mono">AKTİF BİRİM</p>
            <p className="text-sm font-semibold text-white leading-tight">
              {birim.ad}
            </p>
          </div>
        </div>

        {/* Arama */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vaka, sicil, mahalle ara..."
            className="pl-9 h-9 bg-slate-800/40 border-slate-700/60 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/60 focus-visible:ring-blue-500/20 rounded-lg"
          />
        </div>

        {/* Sağ aksiyonlar */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Sistem saati */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500 mr-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>

          {/* WebSocket canlı bağlantı rozeti */}
          <div
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono border",
              wsConnected
                ? "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/[0.06] border-rose-500/30 text-rose-300"
            )}
            title={wsConnected ? `Canlı bağlantı aktif · ${bagliClientSayisi} kişi bağlı` : "Bağlantı yok — yerel mod"}
          >
            <Radio className={wsConnected ? "w-3 h-3 animate-pulse" : "w-3 h-3"} />
            {wsConnected ? "CANLI" : "OFFLINE"}
          </div>

          {/* Bildirimler */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white hover:bg-slate-800/60 h-9 w-9"
                aria-label="Bildirimler"
              >
                <Bell className="w-4 h-4" />
                {okunmamisBildirim > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {okunmamisBildirim}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 sm:w-96 p-0 bg-[#151E2E] border-slate-800 text-white"
            >
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Bildirimler</p>
                  <p className="text-[11px] text-slate-500">
                    {okunmamisBildirim} okunmamış
                  </p>
                </div>
                <Activity className="w-4 h-4 text-slate-500" />
              </div>
              <div className="max-h-80 overflow-y-auto scroll-area-thin">
                {bildirimler.map((b) => (
                  <div
                    key={b.id}
                    className={cn(
                      "px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors",
                      !b.okundu && "bg-blue-500/[0.04]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                          b.seviye === "kritik" && "bg-rose-500",
                          b.seviye === "uyari" && "bg-amber-500",
                          b.seviye === "bilgi" && "bg-slate-500"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-100">
                          {b.baslik}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {b.icerik}
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 mt-1">
                          {formatTarih(b.zaman)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      wsConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    )}
                  />
                  {wsConnected ? `CANLI · ${bagliClientSayisi} kişi` : "ÇEVRİMDIŞI"}
                </span>
                {okunmamisBildirim > 0 && (
                  <button
                    onClick={() => {
                      markAllRead();
                      toast({
                        title: "Bildirimler okundu",
                        description: `${okunmamisBildirim} bildirim okundu olarak işaretlendi.`,
                      });
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Tümünü okundu yap
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Kullanıcı + çıkış */}
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-800/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-200 text-xs font-semibold shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-medium text-white truncate max-w-[140px]">
                  {user.adSoyad}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                  {user.rol} · Sicil: {user.sicil}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogoutClick}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-9 w-9"
              aria-label="Çıkış yap"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* İki kolonlu gövde */}
      <div className="flex-1 flex relative z-10">
        {/* Masaüstü sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-[#0F1623]/80 backdrop-blur-sm">
          <SidebarLogo birim={birim} BirimIcon={BirimIcon} user={user} />
          <SidebarContent
            sidebarItems={sidebarItems}
            activeModule={activeModule}
            onModuleChange={onModuleChange}
          />
          <SidebarFooter birim={birim} />
        </aside>

        {/* Ana içerik */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Alt parçalar (modül seviyesinde, render sırasında oluşturulmuyor) ---

function SidebarContent({
  sidebarItems,
  activeModule,
  onModuleChange,
}: {
  sidebarItems: SidebarItem[];
  activeModule: string;
  onModuleChange: (id: string) => void;
}) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scroll-area-thin">
      {sidebarItems.map((item) => {
        const Icon = item.ikon;
        const active = activeModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onModuleChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-blue-600/15 text-white border border-blue-500/30"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-slate-700/60 text-slate-400"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function SidebarLogo({
  birim,
  BirimIcon,
  user,
}: {
  birim: ReturnType<typeof getBirim>;
  BirimIcon: React.ComponentType<{ className?: string }>;
  user: SessionUser;
}) {
  return (
    <div className="px-4 py-4 border-b border-slate-800/80">
      <div className="flex items-center gap-2.5">
        <BelediyeLogo size={36} rounded="lg" showBackground={false} />
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            KOVANCILAR BELEDİYESİ
          </p>
          <p className="text-sm font-semibold text-white truncate">
            {birim.ad}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-slate-800/40 border border-slate-800">
        <ShieldAlert className="w-3 h-3 text-emerald-400/70 shrink-0" />
        <p className="text-[10px] text-slate-400 font-mono truncate">
          Oturum: {user.sicil} · {birim.kisaAd}
        </p>
      </div>
    </div>
  );
}

function SidebarFooter({ birim }: { birim: ReturnType<typeof getBirim> }) {
  return (
    <div className="mt-auto px-3 py-4 border-t border-slate-800/80">
      <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-800">
        <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">
          BİRİM İZOLASYONU
        </p>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Bu panel yalnızca{" "}
          <span className="text-slate-200 font-medium">{birim.ad}</span>{" "}
          personeli içindir. Diğer birimlerle hesap paylaşımı yapılamaz.
        </p>
      </div>
    </div>
  );
}

// --- Yardımcı: Sayfa başlığı bileşeni (dashboard'lar kullanır) ---

export function DashboardHeader({
  title,
  description,
  actions,
  icon: Icon,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// --- Yardımcı: Stat kartı ---

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { direction: "up" | "down"; value: string };
  tone?: "default" | "kritik" | "yuksek" | "ok";
}) {
  const toneStyles = {
    default: "bg-slate-800/40 border-slate-700/60 text-slate-400",
    kritik: "bg-rose-500/[0.06] border-rose-500/30 text-rose-300",
    yuksek: "bg-amber-500/[0.06] border-amber-500/30 text-amber-300",
    ok: "bg-emerald-500/[0.06] border-emerald-500/30 text-emerald-300",
  };
  const iconColor = {
    default: "text-slate-400",
    kritik: "text-rose-400",
    yuksek: "text-amber-400",
    ok: "text-emerald-400",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors hover:border-slate-600",
        toneStyles[tone]
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider opacity-80">
          {label}
        </span>
        <Icon className={cn("w-4 h-4", iconColor[tone])} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-mono",
              trend.direction === "up"
                ? "text-emerald-400"
                : "text-rose-400"
            )}
          >
            {trend.direction === "up" ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>
      )}
    </div>
  );
}

// --- Yardımcı: Vaka durum/oncelik rozetleri ---

export function OncelikRozet({ oncelik }: { oncelik: string }) {
  const map: Record<string, { label: string; className: string }> = {
    kritik: {
      label: "KRİTİK",
      className: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
    yuksek: {
      label: "YÜKSEK",
      className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    orta: {
      label: "ORTA",
      className: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    dusuk: {
      label: "DÜŞÜK",
      className: "text-slate-400 bg-slate-500/10 border-slate-500/30",
    },
  };
  const item = map[oncelik] ?? map.orta;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}

export function DurumRozet({ durum }: { durum: string }) {
  const map: Record<string, { label: string; className: string }> = {
    yeni: {
      label: "YENİ",
      className: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
    atandi: {
      label: "ATANDI",
      className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    "devam-ediyor": {
      label: "DEVAM",
      className: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    cozuldu: {
      label: "ÇÖZÜLDÜ",
      className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    iptal: {
      label: "İPTAL",
      className: "text-slate-400 bg-slate-500/10 border-slate-500/30",
    },
  };
  const item = map[durum] ?? map.yeni;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}
