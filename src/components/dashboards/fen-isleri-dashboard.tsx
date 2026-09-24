"use client";

import { useMemo, useState } from "react";
import {
  HardHat,
  Construction,
  Footprints,
  Square,
  AlertTriangle,
  Users,
  Truck,
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader, StatCard } from "@/components/app-shell";
import { MiniHarita } from "@/components/shared/mini-harita";
import { VakaKarti } from "@/components/shared/vaka-karti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  VAKALAR,
  EKIPLER,
  MAHALLELER,
  formatTarih,
} from "@/lib/mock-data";
import type { SessionUser, Vaka } from "@/lib/types";

type Module = "genel" | "yol" | "kaldirim" | "parke" | "ekipler" | "yeni-vaka";

export function FenIsleriDashboard({ user }: { user: SessionUser }) {
  const [module, setModule] = useState<Module>("genel");
  const [vakalar, setVakalar] = useState<Vaka[]>(
    VAKALAR.filter((v) => v.birimId === "fen-isleri")
  );

  function addVaka(yeni: Vaka) {
    setVakalar((prev) => [yeni, ...prev]);
  }

  const istatistik = useMemo(() => {
    return {
      toplam: vakalar.length,
      yol: vakalar.filter((v) => v.kategori === "Yol").length,
      kaldirim: vakalar.filter((v) => v.kategori === "Kaldırım").length,
      parke: vakalar.filter((v) => v.kategori === "Parke").length,
      cozuldu: vakalar.filter((v) => v.durum === "cozuldu").length,
      acil: vakalar.filter(
        (v) => v.oncelik === "kritik" && v.durum !== "cozuldu"
      ).length,
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
        title="Fen İşleri Saha Paneli"
        description={`Yol · kaldırım · parke işleri · ${user.adSoyad} (${user.rol})`}
        icon={HardHat}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/60 h-9"
              onClick={() => setModule("yeni-vaka")}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Yeni Vaka
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9"
              onClick={() =>
                toast({
                  title: "Saha planı güncellendi",
                  description: "Bugünkü iş emirleri tüm ekiplere iletildi.",
                })
              }
            >
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Günlük Planı Yayınla
            </Button>
          </>
        }
      />

      {/* Modül sekmeleri */}
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
        <FenGenelBakis
          istatistik={istatistik}
          haritaNoktalari={haritaNoktalari}
          vakalar={vakalar}
        />
      )}
      {module === "yol" && (
        <KategoriListesi vakalar={vakalar} kategori="Yol" ikon={Construction} />
      )}
      {module === "kaldirim" && (
        <KategoriListesi vakalar={vakalar} kategori="Kaldırım" ikon={Footprints} />
      )}
      {module === "parke" && (
        <KategoriListesi vakalar={vakalar} kategori="Parke" ikon={Square} />
      )}
      {module === "ekipler" && <FenEkiplerModulu />}
      {module === "yeni-vaka" && (
        <YeniVakaFormu
          onAdd={addVaka}
          userSicil={user.sicil}
          userAd={user.adSoyad}
        />
      )}
    </div>
  );
}

const MODULES = [
  { id: "genel", label: "Genel Bakış", ikon: Activity },
  { id: "yol", label: "Yol Hasarları", ikon: Construction },
  { id: "kaldirim", label: "Kaldırım", ikon: Footprints },
  { id: "parke", label: "Parke", ikon: Square },
  { id: "ekipler", label: "Ekipler", ikon: Users },
  { id: "yeni-vaka", label: "Yeni Vaka", ikon: Plus },
] as const;

function FenGenelBakis({
  istatistik,
  haritaNoktalari,
  vakalar,
}: {
  istatistik: { toplam: number; yol: number; kaldirim: number; parke: number; cozuldu: number; acil: number };
  haritaNoktalari: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  vakalar: Vaka[];
}) {
  const sonVakalar = [...vakalar]
    .sort((a, b) => new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Toplam Vaka" value={istatistik.toplam} icon={Activity} />
        <StatCard label="Yol Hasarı" value={istatistik.yol} icon={Construction} tone="yuksek" />
        <StatCard label="Kaldırım" value={istatistik.kaldirim} icon={Footprints} />
        <StatCard label="Parke" value={istatistik.parke} icon={Square} />
        <StatCard label="Çözülen" value={istatistik.cozuldu} icon={CheckCircle2} tone="ok" />
        <StatCard label="Acil Müdahale" value={istatistik.acil} icon={AlertTriangle} tone="kritik" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
            FEN İŞLERİ SAHA HARİTASI
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

      {/* Mahalle bazlı yük */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">
          MAHALLE BAZLI FEN İŞLERİ YÜKÜ
        </p>
        <div className="space-y-2.5">
          {MAHALLELER.map((m) => {
            const yuk = m.vakaSayisi;
            const max = 12;
            const pct = (yuk / max) * 100;
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-28 sm:w-32 truncate">{m.ad}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-700/40 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct > 60 ? "bg-rose-500" : pct > 30 ? "bg-amber-500" : "bg-blue-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 w-10 text-right">{yuk}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KategoriListesi({
  vakalar,
  kategori,
  ikon: Icon,
}: {
  vakalar: Vaka[];
  kategori: string;
  ikon: React.ComponentType<{ className?: string }>;
}) {
  const filtreli = vakalar.filter((v) => v.kategori === kategori);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-medium text-white">{kategori} vakaları</p>
          <span className="text-xs text-slate-500">({filtreli.length})</span>
        </div>
        <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white">
          <MapPin className="w-3.5 h-3.5 mr-1.5" />
          Haritada Göster
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtreli.map((v) => (
          <VakaKarti key={v.id} vaka={v} />
        ))}
      </div>

      {filtreli.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Bu kategoride vaka yok.</p>
        </div>
      )}
    </div>
  );
}

function FenEkiplerModulu() {
  const ekipler = EKIPLER.filter((e) => e.birimId === "fen-isleri");
  const araclar = VAKALAR; // placeholder

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

function YeniVakaFormu({
  onAdd,
  userSicil,
  userAd,
}: {
  onAdd: (v: Vaka) => void;
  userSicil: string;
  userAd: string;
}) {
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [adres, setAdres] = useState("");
  const [kategori, setKategori] = useState("Yol");
  const [oncelik, setOncelik] = useState("orta");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!baslik || !aciklama || !mahalle || !adres) {
      toast({
        title: "Eksik bilgi",
        description: "Tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    const yeni: Vaka = {
      id: `V-2026-${Math.floor(1000 + Math.random() * 8999)}`,
      birimId: "fen-isleri",
      baslik,
      aciklama,
      mahalle,
      adres,
      oncelik: oncelik as Vaka["oncelik"],
      durum: "yeni",
      olusturmaZamani: new Date().toISOString(),
      kategori,
      koordinat: { lat: 38.42 + (Math.random() - 0.5) * 0.02, lng: 27.14 + (Math.random() - 0.5) * 0.03 },
    };

    onAdd(yeni);
    setBaslik("");
    setAciklama("");
    setMahalle("");
    setAdres("");
    setKategori("Yol");
    setOncelik("orta");

    toast({
      title: "Vaka oluşturuldu",
      description: `${yeni.id} numaralı vaka sisteme eklendi ve operasyon merkezine bildirildi.`,
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">Yeni Vaka Oluştur</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Başlık *
            </Label>
            <Input
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Örn: Yol çukuru — İnönü Cad."
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Açıklama *
            </Label>
            <Textarea
              value={aciklama}
              onChange={(e) => setAciklama(e.target.value)}
              placeholder="Vakanın detaylı açıklaması..."
              className="mt-1.5 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Mahalle *
              </Label>
              <Select value={mahalle} onValueChange={setMahalle}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue placeholder="Mahalle seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  {MAHALLELER.map((m) => (
                    <SelectItem key={m.id} value={m.ad} className="text-white focus:bg-slate-700">
                      {m.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Adres *
              </Label>
              <Input
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
                placeholder="Sokak, kapı no..."
                className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Kategori
              </Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  <SelectItem value="Yol" className="text-white focus:bg-slate-700">Yol</SelectItem>
                  <SelectItem value="Kaldırım" className="text-white focus:bg-slate-700">Kaldırım</SelectItem>
                  <SelectItem value="Parke" className="text-white focus:bg-slate-700">Parke</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Öncelik
              </Label>
              <Select value={oncelik} onValueChange={setOncelik}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  <SelectItem value="kritik" className="text-white focus:bg-slate-700">Kritik</SelectItem>
                  <SelectItem value="yuksek" className="text-white focus:bg-slate-700">Yüksek</SelectItem>
                  <SelectItem value="orta" className="text-white focus:bg-slate-700">Orta</SelectItem>
                  <SelectItem value="dusuk" className="text-white focus:bg-slate-700">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
            <Clock className="w-3 h-3" />
            <span>
              Bildiren: {userAd} (Sicil: {userSicil}) · {new Date().toLocaleString("tr-TR")}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/60">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300 hover:text-white"
              onClick={() => {
                setBaslik("");
                setAciklama("");
                setMahalle("");
                setAdres("");
              }}
            >
              Temizle
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Vaka Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
