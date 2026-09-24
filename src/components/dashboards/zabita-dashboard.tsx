"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Store,
  Volume2,
  Trash2,
  BadgeCheck,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { DashboardHeader, StatCard } from "@/components/app-shell";
import { MiniHarita } from "@/components/shared/mini-harita";
import { VakaKarti } from "@/components/shared/vaka-karti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  VAKALAR,
  EKIPLER,
  DENETIM_KAYITLARI,
  formatTarih,
} from "@/lib/mock-data";
import type { SessionUser } from "@/lib/types";

type Module = "genel" | "denetimler" | "cezalar" | "sikayetler" | "ekipler";

export function ZabitaDashboard({ user }: { user: SessionUser }) {
  const [module, setModule] = useState<Module>("genel");

  const vakalar = useMemo(
    () => VAKALAR.filter((v) => v.birimId === "zabita"),
    []
  );

  const istatistik = useMemo(() => {
    return {
      toplamVaka: vakalar.length,
      acil: vakalar.filter(
        (v) => v.oncelik === "kritik" && v.durum !== "cozuldu"
      ).length,
      cozuldu: vakalar.filter((v) => v.durum === "cozuldu").length,
      devam: vakalar.filter((v) => v.durum === "devam-ediyor").length,
      denetimSayi: DENETIM_KAYITLARI.length,
      cezaSayi: DENETIM_KAYITLARI.filter((d) => d.sonuc === "ceza").length,
      uyariSayi: DENETIM_KAYITLARI.filter((d) => d.sonuc === "uyari").length,
      uygunSayi: DENETIM_KAYITLARI.filter((d) => d.sonuc === "uygun").length,
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
        title="Zabıta Saha Denetim Paneli"
        description={`Büro & saha denetim · ${user.adSoyad} (${user.rol})`}
        icon={ShieldCheck}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/60 h-9"
              onClick={() =>
                toast({
                  title: "Yeni denetim kaydı",
                  description: "Saha denetim kaydı formu açılıyor...",
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Yeni Denetim
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9"
              onClick={() =>
                toast({
                  title: "Devriye raporu güncellendi",
                  description: "Tüm devriye ekiplerinin konumu merkeze iletildi.",
                })
              }
            >
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Devriye Raporu
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
        <ZabitaGenelBakis
          istatistik={istatistik}
          haritaNoktalari={haritaNoktalari}
          vakalar={vakalar}
        />
      )}
      {module === "denetimler" && <DenetimlerModulu />}
      {module === "cezalar" && <CezalarModulu />}
      {module === "sikayetler" && <SikayetlerModulu vakalar={vakalar} />}
      {module === "ekipler" && <ZabitaEkiplerModulu />}
    </div>
  );
}

const MODULES = [
  { id: "genel", label: "Genel Bakış", ikon: Activity },
  { id: "denetimler", label: "Denetimler", ikon: Store },
  { id: "cezalar", label: "Ceza Kayıtları", ikon: AlertTriangle },
  { id: "sikayetler", label: "Şikayetler", ikon: FileText },
  { id: "ekipler", label: "Saha Ekipleri", ikon: Users },
] as const;

function ZabitaGenelBakis({
  istatistik,
  haritaNoktalari,
  vakalar,
}: {
  istatistik: { toplamVaka: number; acil: number; cozuldu: number; devam: number; denetimSayi: number; cezaSayi: number; uyariSayi: number; uygunSayi: number };
  haritaNoktalari: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  vakalar: typeof VAKALAR;
}) {
  const sonVakalar = [...vakalar]
    .sort((a, b) => new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Aktif Vaka" value={istatistik.toplamVaka} icon={Activity} />
        <StatCard label="Acil" value={istatistik.acil} icon={AlertTriangle} tone="kritik" />
        <StatCard label="Devam Eden" value={istatistik.devam} icon={Clock} tone="yuksek" />
        <StatCard label="Çözülen" value={istatistik.cozuldu} icon={CheckCircle2} tone="ok" />
        <StatCard label="Toplam Denetim" value={istatistik.denetimSayi} icon={Store} />
        <StatCard label="Ceza" value={istatistik.cezaSayi} icon={AlertTriangle} tone="yuksek" />
      </div>

      {/* Denetim sonuç dağılımı */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Uygun" value={istatistik.uygunSayi} icon={BadgeCheck} tone="ok" hint="Denetim uygun" />
        <StatCard label="Uyarı" value={istatistik.uyariSayi} icon={AlertTriangle} tone="yuksek" />
        <StatCard label="Ceza" value={istatistik.cezaSayi} icon={AlertTriangle} tone="kritik" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            ZABITA SAHA HARİTASI
          </p>
          <MiniHarita noktalar={haritaNoktalari} height={320} />
        </div>
        <div>
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            SON VAKALAR
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

function DenetimlerModulu() {
  const [search, setSearch] = useState("");
  const filtreli = DENETIM_KAYITLARI.filter(
    (d) =>
      d.isletme.toLowerCase().includes(search.toLowerCase()) ||
      d.adres.toLowerCase().includes(search.toLowerCase())
  );

  const sonucRenk: Record<string, string> = {
    uygun: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    uyari: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    ceza: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    kapatma: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  };
  const sonucEtiket: Record<string, string> = {
    uygun: "UYGUN",
    uyari: "UYARI",
    ceza: "CEZA",
    kapatma: "KAPATMA",
  };
  const tipIkon: Record<string, React.ComponentType<{ className?: string }>> = {
    Hijyen: Store,
    İşgal: Store,
    Ruhsat: BadgeCheck,
    Gürültü: Volume2,
    Çevre: Trash2,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İşletme veya adres ara..."
            className="pl-8 h-9 bg-slate-800/40 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/60 rounded-lg"
          />
        </div>
        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Yeni Denetim
        </Button>
      </div>

      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Denetim No</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">İşletme</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Tip</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Adres</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Sonuç</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden lg:table-cell">Tarih</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden lg:table-cell">Ekip</th>
            </tr>
          </thead>
          <tbody>
            {filtreli.map((d, i) => {
              const TipIcon = tipIkon[d.tip] ?? Store;
              return (
                <tr
                  key={d.id}
                  className={cn(
                    "border-b border-slate-800 hover:bg-slate-800/30",
                    i % 2 === 1 && "bg-slate-900/20"
                  )}
                >
                  <td className="px-3 py-2.5 text-xs font-mono text-slate-400">{d.id}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-200">{d.isletme}</td>
                  <td className="px-3 py-2.5 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300">
                      <TipIcon className="w-3 h-3 text-slate-500" />
                      {d.tip}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 hidden md:table-cell">{d.adres}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", sonucRenk[d.sonuc])}>
                      {sonucEtiket[d.sonuc]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 font-mono hidden lg:table-cell">{formatTarih(d.zaman)}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 font-mono hidden lg:table-cell">{d.ekip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CezalarModulu() {
  const cezalar = DENETIM_KAYITLARI.filter((d) => d.sonuc === "ceza");
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cezalar.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-rose-500/25 bg-rose-500/[0.04] p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono text-slate-500">{c.id}</p>
                <p className="text-sm font-medium text-white mt-0.5">{c.isletme}</p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-rose-400 bg-rose-500/10 border-rose-500/30">
                CEZA
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-1.5">{c.not}</p>
            <div className="space-y-1 text-[11px] text-slate-500">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {c.adres}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {formatTarih(c.zaman)}
              </p>
              <p className="flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {c.ekip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SikayetlerModulu({ vakalar }: { vakalar: typeof VAKALAR }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {vakalar.map((v) => (
        <VakaKarti key={v.id} vaka={v} />
      ))}
    </div>
  );
}

function ZabitaEkiplerModulu() {
  const ekipler = EKIPLER.filter((e) => e.birimId === "zabita");
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
