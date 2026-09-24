"use client";

import { useMemo, useState } from "react";
import {
  Command,
  Activity,
  Users,
  Truck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Layers3,
  ShieldAlert,
  Clock,
  Radio,
  FileBarChart,
  TrendingUp,
  Building2,
  Settings2,
} from "lucide-react";
import { DashboardHeader, StatCard } from "@/components/app-shell";
import { MiniHarita } from "@/components/shared/mini-harita";
import { VakaKarti } from "@/components/shared/vaka-karti";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ARAÇLAR, MAHALLELER, formatTarih } from "@/lib/mock-data";
import { useOperasyonStore } from "@/lib/store";
import { KayitYonetimiModulu } from "@/components/dashboards/kayit-yonetimi";
import type { SessionUser, Vaka, Ekip } from "@/lib/types";

type Module = "genel" | "harita" | "ekipler" | "araclar" | "vakalar" | "raporlar" | "yonetim";

export function OperasyonDashboard({
  user,
  activeModule: externalModule,
  onModuleChange,
}: {
  user: SessionUser;
  activeModule?: string;
  onModuleChange?: (id: string) => void;
}) {
  // Sidebar ile senkron module state'i
  // (Next.js kuralı: `module` değişken adı yasak, `aktifModul` kullandık)
  const [internalModule, setInternalModule] = useState<Module>("genel");
  const aktifModul = (externalModule as Module) ?? internalModule;
  const setAktifModul = (m: Module) => {
    setInternalModule(m);
    onModuleChange?.(m);
  };

  // Zustand store'dan canlı veri al
  const tumVakalar = useOperasyonStore((s) => s.vakalar);
  const EKIPLER = useOperasyonStore((s) => s.ekipler);

  const istatistik = useMemo(() => {
    const tum = tumVakalar;
    return {
      toplam: tum.length,
      acil: tum.filter(
        (v) => v.oncelik === "kritik" && v.durum !== "cozuldu"
      ).length,
      devam: tum.filter((v) => v.durum === "devam-ediyor").length,
      cozuldu: tum.filter((v) => v.durum === "cozuldu").length,
      yeni: tum.filter((v) => v.durum === "yeni").length,
      atanan: tum.filter((v) => v.durum === "atandi").length,
    };
  }, [tumVakalar]);

  const haritaNoktalari = useMemo(() => {
    return tumVakalar
      .filter((v) => v.koordinat)
      .map((v) => ({
        lat: v.koordinat!.lat,
        lng: v.koordinat!.lng,
        etiket: v.id,
        oncelik: v.oncelik,
      }));
  }, [tumVakalar]);

  const aktifEkipler = EKIPLER.filter((e) => e.durum === "gorevde").length;
  const musaitEkipler = EKIPLER.filter((e) => e.durum === "musait").length;
  const gorevdeAraclar = ARAÇLAR.filter((a) => a.durum === "gorevde").length;

  return (
    <div>
      <DashboardHeader
        title="Operasyon Komuta Merkezi"
        description={`Tüm birimlerin canlı durumu · ${user.adSoyad} (${user.rol}) · Komuta merkezi tam yetki`}
        icon={Command}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/60 h-9"
              onClick={() =>
                toast({
                  title: "Canlı durum yenilendi",
                  description: "Tüm birimlerin anlık durumu senkronize edildi.",
                })
              }
            >
              <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Canlı Yayın
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9"
              onClick={() =>
                toast({
                  title: "Tüm birimlere bildirim gönderildi",
                  description: "Acil durum brifingi tüm saha ekiplerine iletildi.",
                })
              }
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              Tüm Birimlere Bildir
            </Button>
          </>
        }
      />

      {/* Modül sekmeleri */}
      <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-800">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setAktifModul(m.id as Module)}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors",
              aktifModul === m.id
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-100"
            )}
          >
            <m.ikon className="w-3.5 h-3.5 inline-block mr-1.5" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Modül içeriği */}
      {aktifModul === "genel" && (
        <GenelBakis
          istatistik={istatistik}
          haritaNoktalari={haritaNoktalari}
          tumVakalar={tumVakalar}
          aktifEkipler={aktifEkipler}
          musaitEkipler={musaitEkipler}
          toplamEkip={EKIPLER.length}
          gorevdeAraclar={gorevdeAraclar}
        />
      )}
      {aktifModul === "harita" && (
        <HaritaModulu haritaNoktalari={haritaNoktalari} tumVakalar={tumVakalar} />
      )}
      {aktifModul === "ekipler" && <EkiplerModulu />}
      {aktifModul === "araclar" && <AraclarModulu />}
      {aktifModul === "vakalar" && <VakalarModulu tumVakalar={tumVakalar} />}
      {aktifModul === "raporlar" && <RaporlarModulu tumVakalar={tumVakalar} />}
      {aktifModul === "yonetim" && <KayitYonetimiModulu />}
    </div>
  );
}

const MODULES = [
  { id: "genel", label: "Genel Bakış", ikon: Activity },
  { id: "harita", label: "Saha Haritası", ikon: MapPin },
  { id: "ekipler", label: "Ekipler", ikon: Users },
  { id: "araclar", label: "Araç Filosu", ikon: Truck },
  { id: "vakalar", label: "Tüm Vakalar", ikon: AlertTriangle },
  { id: "raporlar", label: "Raporlar", ikon: FileBarChart },
  { id: "yonetim", label: "Kayıt Yönetimi", ikon: Settings2 },
] as const;

// --- Genel Bakış ---

function GenelBakis({
  istatistik,
  haritaNoktalari,
  tumVakalar,
  aktifEkipler,
  musaitEkipler,
  toplamEkip,
  gorevdeAraclar,
}: {
  istatistik: { toplam: number; acil: number; devam: number; cozuldu: number; yeni: number; atanan: number };
  haritaNoktalari: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  tumVakalar: Vaka[];
  aktifEkipler: number;
  musaitEkipler: number;
  toplamEkip: number;
  gorevdeAraclar: number;
}) {
  const sonVakalar = [...tumVakalar]
    .sort((a, b) => new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat satırı */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Toplam Vaka" value={istatistik.toplam} icon={Activity} trend={{ direction: "up", value: "+3 bu hafta" }} />
        <StatCard label="Acil" value={istatistik.acil} icon={ShieldAlert} tone="kritik" hint="Çözülmemiş kritik" />
        <StatCard label="Devam Eden" value={istatistik.devam} icon={Clock} tone="yuksek" />
        <StatCard label="Yeni" value={istatistik.yeni} icon={AlertTriangle} tone="yuksek" />
        <StatCard label="Atanan" value={istatistik.atanan} icon={Users} />
        <StatCard label="Çözülen" value={istatistik.cozuldu} icon={CheckCircle2} tone="ok" trend={{ direction: "up", value: "+2 bu hafta" }} />
      </div>

      {/* Ekip + Araç satırı */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Görevdeki Ekipler" value={`${aktifEkipler}/${toplamEkip}`} icon={Users} hint={`${musaitEkipler} ekip müsait bekliyor`} />
        <StatCard label="Görevdeki Araçlar" value={`${gorevdeAraclar}/${ARAÇLAR.length}`} icon={Truck} />
        <StatCard label="Aktif Mahalle" value={MAHALLELER.filter((m) => m.vakaSayisi > 0).length} icon={Building2} hint={`${MAHALLELER.length} mahalle toplam`} />
      </div>

      {/* Harita + son vakalar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            SAHA HARİTASI — CANLI
          </p>
          <MiniHarita noktalar={haritaNoktalari} height={320} />
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            SON 5 VAKA
          </p>
          <div className="space-y-2 max-h-[320px] overflow-y-auto scroll-area-thin pr-1">
            {sonVakalar.map((v) => (
              <VakaKarti key={v.id} vaka={v} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Harita modülü ---

function HaritaModulu({
  haritaNoktalari,
  tumVakalar,
}: {
  haritaNoktalari: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  tumVakalar: Vaka[];
}) {
  return (
    <div className="space-y-4">
      <MiniHarita noktalar={haritaNoktalari} height={460} />

      {/* Nokta listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {tumVakalar
          .filter((v) => v.koordinat)
          .map((v) => (
            <div
              key={v.id}
              className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    v.oncelik === "kritik" && "bg-rose-500",
                    v.oncelik === "yuksek" && "bg-amber-500",
                    v.oncelik === "orta" && "bg-blue-500",
                    v.oncelik === "dusuk" && "bg-slate-500"
                  )}
                />
                <span className="text-[10px] font-mono text-slate-500">
                  {v.id}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium truncate">
                {v.baslik}
              </p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                {v.koordinat!.lat.toFixed(4)}°K · {v.koordinat!.lng.toFixed(4)}°D
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {v.mahalle} · {v.adres}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

// --- Ekipler modülü ---

function EkiplerModulu() {
  const ekipler = useOperasyonStore((s) => s.ekipler);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          TÜM BİRİM EKİPLERİ — {ekipler.length} EKİP
        </p>
        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
          <Users className="w-3.5 h-3.5 mr-1.5" />
          Ekip Dağılımı
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ekipler.map((ekip) => (
          <EkipKarti key={ekip.id} ekip={ekip} />
        ))}
      </div>
    </div>
  );
}

function EkipKarti({ ekip }: { ekip: Ekip }) {
  const durumRenk: Record<string, string> = {
    gorevde: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    musait: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    mola: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    izinde: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  };
  const durumEtiket: Record<string, string> = {
    gorevde: "GÖREVDE",
    musait: "MÜSAİT",
    mola: "MOLADA",
    izinde: "İZİNDE",
  };

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-mono text-slate-500">{ekip.id}</p>
          <p className="text-sm font-medium text-white mt-0.5">{ekip.ad}</p>
        </div>
        <span
          className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded border",
            durumRenk[ekip.durum]
          )}
        >
          {durumEtiket[ekip.durum]}
        </span>
      </div>
      <div className="space-y-1 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Lider</span>
          <span className="text-slate-200">{ekip.lider}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Üye sayısı</span>
          <span className="text-slate-200">{ekip.uyeSayisi} kişi</span>
        </div>
        {ekip.arac && (
          <div className="flex items-center justify-between">
            <span>Araç</span>
            <span className="text-slate-200 font-mono">{ekip.arac}</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <span className="shrink-0">Konum</span>
          <span className="text-slate-300 text-right truncate">{ekip.konum}</span>
        </div>
      </div>
    </div>
  );
}

// --- Araçlar modülü ---

function AraclarModulu() {
  return (
    <div className="rounded-xl border border-slate-700/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/40 border-b border-slate-700">
          <tr>
            <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Plaka</th>
            <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Tür</th>
            <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Birim</th>
            <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Durum</th>
            <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">KM</th>
            <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Sürücü/Ekip</th>
          </tr>
        </thead>
        <tbody>
          {ARAÇLAR.map((arac, i) => {
            const durumRenk: Record<string, string> = {
              gorevde: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
              musait: "text-blue-400 bg-blue-500/10 border-blue-500/30",
              bakim: "text-amber-400 bg-amber-500/10 border-amber-500/30",
            };
            const durumEtiket: Record<string, string> = {
              gorevde: "GÖREVDE",
              musait: "MÜSAİT",
              bakim: "BAKIMDA",
            };
            const birimler: Record<string, string> = {
              "fen-isleri": "Fen İşleri",
              zabita: "Zabıta",
              altyapi: "Altyapı",
            };
            return (
              <tr
                key={arac.id}
                className={cn(
                  "border-b border-slate-800 hover:bg-slate-800/30",
                  i % 2 === 1 && "bg-slate-900/20"
                )}
              >
                <td className="px-3 py-2.5 font-mono text-slate-200 text-xs">{arac.plaka}</td>
                <td className="px-3 py-2.5 text-slate-300 text-xs">{arac.tur}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs hidden sm:table-cell">{birimler[arac.birimId]}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[arac.durum])}>
                    {durumEtiket[arac.durum]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs font-mono hidden md:table-cell">
                  {arac.km.toLocaleString("tr-TR")}
                </td>
                <td className="px-3 py-2.5 text-slate-400 text-xs hidden md:table-cell">{arac.surucu ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Vakalar modülü ---

function VakalarModulu({ tumVakalar }: { tumVakalar: Vaka[] }) {
  const [filter, setFilter] = useState<string>("all");
  const filtreli = useMemo(() => {
    if (filter === "all") return tumVakalar;
    if (filter === "open") return tumVakalar.filter((v) => v.durum !== "cozuldu" && v.durum !== "iptal");
    if (filter === "kritik") return tumVakalar.filter((v) => v.oncelik === "kritik");
    return tumVakalar.filter((v) => v.birimId === filter);
  }, [filter, tumVakalar]);

  const filtreler = [
    { id: "all", label: "Tümü" },
    { id: "open", label: "Açık" },
    { id: "kritik", label: "Kritik" },
    { id: "fen-isleri", label: "Fen İşleri" },
    { id: "zabita", label: "Zabıta" },
    { id: "altyapi", label: "Altyapı" },
    { id: "idari-isler", label: "İdari İşler" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {filtreler.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-colors",
              filter === f.id
                ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                : "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtreli.map((v) => (
          <VakaKarti key={v.id} vaka={v} />
        ))}
      </div>

      {filtreli.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Layers3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Bu filtre için vaka bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}

// --- Raporlar modülü ---

function RaporlarModulu({ tumVakalar }: { tumVakalar: Vaka[] }) {
  const birimBazli = useMemo(() => {
    const map = new Map<string, number>();
    tumVakalar.forEach((v) => {
      map.set(v.birimId, (map.get(v.birimId) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tumVakalar]);

  const durumBazli = useMemo(() => {
    const map = new Map<string, number>();
    tumVakalar.forEach((v) => {
      map.set(v.durum, (map.get(v.durum) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [tumVakalar]);

  const oncelikBazli = useMemo(() => {
    const map = new Map<string, number>();
    tumVakalar.forEach((v) => {
      map.set(v.oncelik, (map.get(v.oncelik) ?? 0) + 1);
    });
    return Array.from(map.entries());
  }, [tumVakalar]);

  const birimAdlari: Record<string, string> = {
    operasyon: "Operasyon Merkezi",
    "fen-isleri": "Fen İşleri",
    zabita: "Zabıta",
    altyapi: "Altyapı",
    "idari-isler": "İdari İşler",
  };
  const durumAdlari: Record<string, string> = {
    yeni: "Yeni",
    atandi: "Atandı",
    "devam-ediyor": "Devam Ediyor",
    cozuldu: "Çözüldü",
    iptal: "İptal",
  };
  const oncelikAdlari: Record<string, string> = {
    kritik: "Kritik",
    yuksek: "Yüksek",
    orta: "Orta",
    dusuk: "Düşük",
  };
  const oncelikRenk: Record<string, string> = {
    kritik: "bg-rose-500",
    yuksek: "bg-amber-500",
    orta: "bg-blue-500",
    dusuk: "bg-slate-500",
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Birim bazlı */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
            BİRİM BAZLI VAKA DAĞILIMI
          </p>
          <div className="space-y-3">
            {birimBazli.map(([birimId, sayi]) => {
              const max = Math.max(...birimBazli.map(([, n]) => n));
              const pct = (sayi / max) * 100;
              return (
                <div key={birimId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{birimAdlari[birimId]}</span>
                    <span className="text-slate-400 font-mono">{sayi}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Durum bazlı */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
            DURUM DAĞILIMI
          </p>
          <div className="space-y-2">
            {durumBazli.map(([durum, sayi]) => (
              <div key={durum} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{durumAdlari[durum]}</span>
                <span className="text-slate-400 font-mono">{sayi}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Öncelik bazlı */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
            ÖNCELİK DAĞILIMI
          </p>
          <div className="space-y-2">
            {oncelikBazli.map(([oncelik, sayi]) => (
              <div key={oncelik} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", oncelikRenk[oncelik])} />
                  <span className="text-slate-300">{oncelikAdlari[oncelik]}</span>
                </span>
                <span className="text-slate-400 font-mono">{sayi}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aylık trend */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              AYLIK VAKA TRENDİ — 2026
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Tüm birimlerin aylık vaka sayıları</p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {[34, 41, 38, 45, 52, 48, 56, 49, 53].map((v, i) => {
            const ay = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
            const max = 56;
            const pct = (v / max) * 100;
            const isLast = i === 8;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-t transition-all",
                    isLast ? "bg-blue-500" : "bg-blue-500/30"
                  )}
                  style={{ height: `${pct}%` }}
                  title={`${ay[i]}: ${v} vaka`}
                />
                <span className="text-[9px] font-mono text-slate-500">{ay[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
