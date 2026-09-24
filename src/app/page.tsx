"use client";

import { useState, useEffect, useMemo } from "react";
import { LoginScreen } from "@/components/login-screen";
import {
  AppShell,
  type SidebarItem,
} from "@/components/app-shell";
import { OperasyonDashboard } from "@/components/dashboards/operasyon-dashboard";
import { FenIsleriDashboard } from "@/components/dashboards/fen-isleri-dashboard";
import { ZabitaDashboard } from "@/components/dashboards/zabita-dashboard";
import { AltyapiDashboard } from "@/components/dashboards/altyapi-dashboard";
import { IdariIslerDashboard } from "@/components/dashboards/idari-isler-dashboard";
import {
  loadSession,
  saveSession,
  clearSession,
  getBirim,
} from "@/lib/auth";
import {
  VAKALAR,
  OPERASYON_OZEL_VAKALAR,
} from "@/lib/mock-data";
import type { BirimId, SessionUser } from "@/lib/types";
import {
  Activity,
  MapPin,
  Users,
  Truck,
  AlertTriangle,
  FileBarChart,
  HardHat,
  Construction,
  Footprints,
  Square,
  Plus,
  ShieldCheck,
  Store,
  FileText,
  Inbox,
  Archive,
  Layers,
  Droplets,
  Waves,
  Settings2,
  TestTube,
} from "lucide-react";

// Birim bazlı sidebar modül konfigürasyonu
const BIRIM_MODULE_MAP: Record<BirimId, SidebarItem[]> = {
  operasyon: [
    { id: "genel", label: "Genel Bakış", ikon: Activity },
    { id: "harita", label: "Saha Haritası", ikon: MapPin },
    { id: "ekipler", label: "Ekipler", ikon: Users },
    { id: "araclar", label: "Araç Filosu", ikon: Truck },
    { id: "vakalar", label: "Tüm Vakalar", ikon: AlertTriangle },
    { id: "raporlar", label: "Raporlar", ikon: FileBarChart },
  ],
  "fen-isleri": [
    { id: "genel", label: "Genel Bakış", ikon: Activity },
    { id: "yol", label: "Yol Hasarları", ikon: Construction },
    { id: "kaldirim", label: "Kaldırım", ikon: Footprints },
    { id: "parke", label: "Parke", ikon: Square },
    { id: "ekipler", label: "Ekipler", ikon: Users },
    { id: "yeni-vaka", label: "Yeni Vaka", ikon: Plus },
  ],
  zabita: [
    { id: "genel", label: "Genel Bakış", ikon: Activity },
    { id: "denetimler", label: "Denetimler", ikon: Store },
    { id: "cezalar", label: "Ceza Kayıtları", ikon: AlertTriangle },
    { id: "sikayetler", label: "Şikayetler", ikon: FileText },
    { id: "ekipler", label: "Saha Ekipleri", ikon: Users },
  ],
  altyapi: [
    { id: "genel", label: "Genel Bakış", ikon: Activity },
    { id: "su-ariza", label: "Su Arızaları", ikon: Droplets },
    { id: "kanalizasyon", label: "Kanalizasyon", ikon: Waves },
    { id: "vana-takip", label: "Vana Takibi", ikon: Settings2 },
    { id: "ekipler", label: "Ekipler", ikon: Users },
    { id: "numune", label: "Numune Analizi", ikon: TestTube },
  ],
  "idari-isler": [
    { id: "genel", label: "Genel Bakış", ikon: Activity },
    { id: "evrak", label: "Evrak Kayıt", ikon: Inbox },
    { id: "raporlar", label: "Raporlar", ikon: FileText },
    { id: "arsiv", label: "Arşiv", ikon: Archive },
    { id: "personel", label: "Personel", ikon: Users },
  ],
};

// Birim bazlı vaka sayacı (sidebar'da gösterilecek)
function getBirimVakaSayisi(birimId: BirimId): number {
  if (birimId === "operasyon") {
    return [...VAKALAR, ...OPERASYON_OZEL_VAKALAR].filter(
      (v) => v.durum !== "cozuldu" && v.durum !== "iptal"
    ).length;
  }
  return VAKALAR.filter(
    (v) => v.birimId === birimId && v.durum !== "cozuldu" && v.durum !== "iptal"
  ).length;
}

export default function Home() {
  // Hydration güvenliği: ilk render'da login ekranını gösteriyoruz, sonra session kontrolü
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activeModule, setActiveModule] = useState<string>("genel");

  useEffect(() => {
    // Mount tespiti — Next.js'te 'use client' bileşeninde localStorage erişimi
    // için gerekli standart pattern. İlk client render'da çalışır, tekrar tetiklenmez.
    // Lint kuralı cascading render endişesi taşır ama bu tek seferlik mount
    // bayrağıdır ve güvenlidir.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const session = loadSession();
    if (session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(session);
    }
  }, []);

  function handleLogin(sessionUser: SessionUser) {
    saveSession(sessionUser);
    setUser(sessionUser);
    setActiveModule("genel");
  }

  function handleLogout() {
    clearSession();
    setUser(null);
  }

  // Birim değiştiğinde modülü sıfırla — render sırasında modülü
  // birime göre türetiyoruz, setState'i effect içinde çağırmıyoruz
  // (ileride "genel" dışında bir modülde login yapılırsa eski birimden kalan
  // modül kimliği kalabilir; bunu handleLogin içinde "genel" olarak
  // sıfırlayarak çözüyoruz, ek effect gerekmiyor).

  // SSR/hydration: mount olmadan önce minimal bir placeholder göster
  if (!mounted) {
    return (
      <div
        style={{
          backgroundColor: "#0B1120",
          minHeight: "100vh",
          width: "100%",
        }}
      />
    );
  }

  // Login ekranı
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Birim paneli
  const birim = getBirim(user.birimId);
  const sidebarItems: SidebarItem[] = BIRIM_MODULE_MAP[user.birimId].map(
    (item) => {
      if (item.id === "vakalar" || item.id === "sikayetler" || item.id === "yol" || item.id === "kaldirim" || item.id === "parke" || item.id === "su-ariza" || item.id === "kanalizasyon") {
        const sayi = getBirimVakaSayisi(user.birimId);
        if (sayi > 0) return { ...item, count: sayi };
      }
      return item;
    }
  );

  return (
    <AppShell
      user={user}
      sidebarItems={sidebarItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onLogout={handleLogout}
    >
      {renderDashboard(user, activeModule)}
    </AppShell>
  );
}

function renderDashboard(user: SessionUser, module: string) {
  switch (user.birimId) {
    case "operasyon":
      return <OperasyonDashboard user={user} />;
    case "fen-isleri":
      return <FenIsleriDashboard user={user} />;
    case "zabita":
      return <ZabitaDashboard user={user} />;
    case "altyapi":
      return <AltyapiDashboard user={user} />;
    case "idari-isler":
      return <IdariIslerDashboard user={user} />;
    default:
      return null;
  }
}
