"use client";

import { useMemo, useState } from "react";
import {
  Layers,
  Droplets,
  Waves,
  Activity,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Settings2,
  Gauge,
  Wrench,
  TestTube,
} from "lucide-react";
import { DashboardHeader, StatCard } from "@/components/app-shell";
import { MiniHarita } from "@/components/shared/mini-harita";
import { VakaKarti } from "@/components/shared/vaka-karti";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  VAKALAR,
  EKIPLER,
  SU_ARIZA,
  formatTarih,
} from "@/lib/mock-data";
import type { SessionUser } from "@/lib/types";

type Module = "genel" | "su-ariza" | "kanalizasyon" | "vana-takip" | "ekipler" | "numune";

export function AltyapiDashboard({ user }: { user: SessionUser }) {
  const [module, setModule] = useState<Module>("genel");

  const vakalar = useMemo(
    () => VAKALAR.filter((v) => v.birimId === "altyapi"),
    []
  );

  const istatistik = useMemo(() => {
    return {
      toplamVaka: vakalar.length,
      suKirma: SU_ARIZA.filter((s) => s.tur === "kirilma").length,
      tikanma: SU_ARIZA.filter((s) => s.tur === "tikanma").length,
      sizi: SU_ARIZA.filter((s) => s.tur === "sizi").length,
      acil: SU_ARIZA.filter((s) => s.oncelik === "kritik" && s.durum !== "cozuldu").length,
      cozuldu: SU_ARIZA.filter((s) => s.durum === "cozuldu").length,
      devam: SU_ARIZA.filter((s) => s.durum === "devam-ediyor").length,
      yeni: SU_ARIZA.filter((s) => s.durum === "yeni").length,
    };
  }, [vakalar]);

  const haritaNoktalari = useMemo(() => {
    return vakalar
      .filter((v) => v.koordinat)
      .map((v) => ({
        lat: v.koordinat!.lat,
        lng: v.koordinat!.lng,
        etiket: v.id,
        oncelik: v.oncelik,
      }));
  }, [vakalar]);

  return (
    <div>
      <DashboardHeader
        title="Altyapı Koordinasyon Paneli"
        description={`Su · kanalizasyon · vana takibi · ${user.adSoyad} (${user.rol})`}
        icon={Layers}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/60 h-9"
              onClick={() =>
                toast({
                  title: "Yeni arıza kaydı",
                  description: "Arıza bildirim formu açılıyor...",
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Arıza Bildir
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9"
              onClick={() =>
                toast({
                  title: "Tüm vana odaları kontrol edildi",
                  description: "Şebeke basınç değerleri normal aralıkta.",
                })
              }
            >
              <Gauge className="w-3.5 h-3.5 mr-1.5" />
              Şebeke Durumu
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-800 overflow-x-auto">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setModule(m.id as Module)}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              module === m.id
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-100"
            )}
          >
            <m.ikon className="w-3.5 h-3.5 inline-block mr-1.5" />
            {m.label}
          </button>
        ))}
      </div>

      {module === "genel" && (
        <AltyapiGenelBakis
          istatistik={istatistik}
          haritaNoktalari={haritaNoktalari}
          vakalar={vakalar}
        />
      )}
      {module === "su-ariza" && <SuArizaModulu />}
      {module === "kanalizasyon" && <KanalizasyonModulu />}
      {module === "vana-takip" && <VanaTakipModulu />}
      {module === "ekipler" && <AltyapiEkiplerModulu />}
      {module === "numune" && <NumuneModulu />}
    </div>
  );
}

const MODULES = [
  { id: "genel", label: "Genel Bakış", ikon: Activity },
  { id: "su-ariza", label: "Su Arızaları", ikon: Droplets },
  { id: "kanalizasyon", label: "Kanalizasyon", ikon: Waves },
  { id: "vana-takip", label: "Vana Takibi", ikon: Settings2 },
  { id: "ekipler", label: "Ekipler", ikon: Users },
  { id: "numune", label: "Numune Analizi", ikon: TestTube },
] as const;

function AltyapiGenelBakis({
  istatistik,
  haritaNoktalari,
  vakalar,
}: {
  istatistik: { toplamVaka: number; suKirma: number; tikanma: number; sizi: number; acil: number; cozuldu: number; devam: number; yeni: number };
  haritaNoktalari: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  vakalar: typeof VAKALAR;
}) {
  const sonVakalar = [...vakalar]
    .sort((a, b) => new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Toplam Vaka" value={istatistik.toplamVaka} icon={Activity} />
        <StatCard label="Acil Müdahale" value={istatistik.acil} icon={AlertTriangle} tone="kritik" />
        <StatCard label="Devam Eden" value={istatistik.devam} icon={Clock} tone="yuksek" />
        <StatCard label="Yeni Bildirim" value={istatistik.yeni} icon={AlertTriangle} tone="yuksek" />
        <StatCard label="Çözülen" value={istatistik.cozuldu} icon={CheckCircle2} tone="ok" />
        <StatCard label="Su Kırılma" value={istatistik.suKirma} icon={Droplets} tone="kritik" />
      </div>

      {/* Şebeke istatistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Şebeke Basıncı</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">3.2</span>
            <span className="text-sm text-slate-400">bar</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1.5">▲ Normal aralık</p>
        </div>

        <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Günlük Tüketim</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">1.842</span>
            <span className="text-sm text-slate-400">m³</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">Bugün merkez mahalle</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Kayıp Oranı</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">12%</span>
          </div>
          <p className="text-[11px] text-rose-400 mt-1.5">▼ Hedefin altında (hedef: %15)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            ALTYAPI SAHA HARİTASI
          </p>
          <MiniHarita noktalar={haritaNoktalari} height={320} />
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            SON ARIZA BİLDİRİMLERİ
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

function SuArizaModulu() {
  const turRenk: Record<string, string> = {
    kirilma: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    sizi: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    koku: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    tikanma: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    renk: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  };
  const turEtiket: Record<string, string> = {
    kirilma: "KIRILMA",
    sizi: "SIZINTI",
    koku: "KOKU",
    tikanma: "TIKANMA",
    renk: "RENK DEĞ.",
  };
  const turIkon: Record<string, React.ComponentType<{ className?: string }>> = {
    kirilma: AlertTriangle,
    sizi: Droplets,
    koku: Waves,
    tikanma: Waves,
    renk: TestTube,
  };

  const durumRenk: Record<string, string> = {
    yeni: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    atandi: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    "devam-ediyor": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    cozuldu: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  };
  const durumEtiket: Record<string, string> = {
    yeni: "YENİ",
    atandi: "ATANDI",
    "devam-ediyor": "DEVAM",
    cozuldu: "ÇÖZÜLDÜ",
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
        SU ARIZA KAYITLARI — {SU_ARIZA.length} KAYIT
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SU_ARIZA.map((s) => {
          const TurIcon = turIkon[s.tur] ?? Droplets;
          return (
            <div
              key={s.id}
              className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] font-mono text-slate-500">{s.id}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{s.mahalle}</p>
                </div>
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", turRenk[s.tur])}>
                  {turEtiket[s.tur]}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                {s.adres}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[s.durum])}>
                  {durumEtiket[s.durum]}
                </span>
                <span className="font-mono">{formatTarih(s.acildigiZaman)}</span>
              </div>
              {s.atananEkip && (
                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  {s.atananEkip}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanalizasyonModulu() {
  const kanal = SU_ARIZA.filter((s) => s.tur === "tikanma" || s.tur === "koku");
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
          KANALİZASYON HATTI DURUMU
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3">
            <p className="text-[10px] font-mono text-slate-500">AKTİF HATLAR</p>
            <p className="text-xl font-bold text-white mt-1">147</p>
          </div>
          <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3">
            <p className="text-[10px] font-mono text-slate-500">TIKANMIŞ</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{kanal.length}</p>
          </div>
          <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3">
            <p className="text-[10px] font-mono text-slate-500">POMPA İSTASYONU</p>
            <p className="text-xl font-bold text-white mt-1">4</p>
          </div>
          <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3">
            <p className="text-[10px] font-mono text-slate-500">SON BAKIM</p>
            <p className="text-xs font-mono text-slate-300 mt-1">12.09.2026</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {kanal.map((s) => (
          <div
            key={s.id}
            className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono text-slate-500">{s.id}</p>
                <p className="text-sm font-medium text-white mt-0.5">{s.mahalle}</p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-orange-400 bg-orange-500/10 border-orange-500/30">
                {s.tur === "tikanma" ? "TIKANMA" : "KOKU"}
              </span>
            </div>
            <p className="text-xs text-slate-400">{s.adres}</p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono">{formatTarih(s.acildigiZaman)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VanaTakipModulu() {
  // Demo vana listesi
  const VANALAR = [
    { id: "V-001", mahalle: "Merkez", konum: "Cumhuriyet Cad. No:1", durum: "açik", sonOkuma: "2.8 bar", zaman: ahora(0) },
    { id: "V-002", mahalle: "Cumhuriyet", konum: "İnönü Cad. No:14", durum: "açik", sonOkuma: "3.1 bar", zaman: hace(0) },
    { id: "V-003", mahalle: "Yenidoğan", konum: "1453. Sokak No:4", durum: "kapali", sonOkuma: "0.0 bar", zaman: hace(1) },
    { id: "V-004", mahalle: "Atatürk", konum: "1428. Sokak No:7", durum: "açik", sonOkuma: "2.9 bar", zaman: hace(0) },
    { id: "V-005", mahalle: "İstasyon", konum: "Demirçelik Cad. No:18", durum: "kismen", sonOkuma: "1.4 bar", zaman: hace(0) },
    { id: "V-006", mahalle: "Recepkaya", konum: "Çamlık Sok. No:9", durum: "açik", sonOkuma: "3.3 bar", zaman: hace(1) },
  ];

  const durumRenk: Record<string, string> = {
    açik: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    kapali: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    kismen: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  };
  const durumEtiket: Record<string, string> = {
    açik: "AÇIK",
    kapali: "KAPALI",
    kismen: "KISMEN AÇIK",
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
        VANA ODASI DURUM TAKİBİ — {VANALAR.length} NOKTA
      </p>
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Vana No</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Mahalle</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Konum</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Durum</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Basınç</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden lg:table-cell">Son Okuma</th>
            </tr>
          </thead>
          <tbody>
            {VANALAR.map((v, i) => (
              <tr
                key={v.id}
                className={cn(
                  "border-b border-slate-800 hover:bg-slate-800/30",
                  i % 2 === 1 && "bg-slate-900/20"
                )}
              >
                <td className="px-3 py-2.5 font-mono text-slate-200 text-xs">{v.id}</td>
                <td className="px-3 py-2.5 text-slate-300 text-xs hidden sm:table-cell">{v.mahalle}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs">{v.konum}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[v.durum])}>
                    {durumEtiket[v.durum]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs font-mono hidden md:table-cell">{v.sonOkuma}</td>
                <td className="px-3 py-2.5 text-slate-500 text-xs font-mono hidden lg:table-cell">{formatTarih(v.zaman)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AltyapiEkiplerModulu() {
  const ekipler = EKIPLER.filter((e) => e.birimId === "altyapi");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Toplam Ekip" value={ekipler.length} icon={Users} />
        <StatCard label="Görevdeki" value={ekipler.filter((e) => e.durum === "gorevde").length} icon={Activity} tone="yuksek" />
        <StatCard label="Müsait" value={ekipler.filter((e) => e.durum === "musait").length} icon={CheckCircle2} tone="ok" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ekipler.map((ekip) => {
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
            <div
              key={ekip.id}
              className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors"
            >
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
                  <span>Üye</span>
                  <span className="text-slate-200">{ekip.uyeSayisi}</span>
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
        })}
      </div>
    </div>
  );
}

function NumuneModulu() {
  const NUMUNELER = [
    { id: "N-2026-001", mahalle: "Recepkaya", nokta: "Çamlık Sok. No:9", sonuc: "UYGUN", parametre: "Koku, pH, Bulanıklık", zaman: hace(2) },
    { id: "N-2026-002", mahalle: "Merkez", nokta: "Cumhuriyet Cad. No:55", sonuc: "BEKLENIYOR", parametre: "Renk, Demir, Mangan", zaman: hace(0) },
    { id: "N-2026-003", mahalle: "Yenidoğan", nokta: "1453. Sokak No:4", sonuc: "UYARI", parametre: "Bulanıklık yüksek", zaman: hace(1) },
    { id: "N-2026-004", mahalle: "Cumhuriyet", nokta: "İnönü Cad. No:14", sonuc: "UYGUN", parametre: "Standart parametreler", zaman: hace(4) },
  ];

  const sonucRenk: Record<string, string> = {
    UYGUN: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    BEKLENIYOR: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    UYARI: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    RED: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
          SU NUMUNE ANALİZ KAYITLARI
        </p>
        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Numune Al
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NUMUNELER.map((n) => (
          <div
            key={n.id}
            className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono text-slate-500">{n.id}</p>
                <p className="text-sm font-medium text-white mt-0.5">{n.mahalle}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.nokta}</p>
              </div>
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", sonucRenk[n.sonuc])}>
                {n.sonuc}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">{n.parametre}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">{formatTarih(n.zaman)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// helpers (copy — module-local)
const ahora = (gunOnce: number) => {
  const d = new Date();
  d.setDate(d.getDate() - gunOnce);
  d.setHours(8 + (gunOnce % 10), (gunOnce * 7) % 60, 0, 0);
  return d.toISOString();
};
const hace = (gunOnce: number) => ahora(gunOnce);
