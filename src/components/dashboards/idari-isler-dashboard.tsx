"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Activity,
  FolderCheck,
  Users,
  CheckCircle2,
  Clock,
  Inbox,
  Archive,
  Plus,
  Search,
  Send,
  Printer,
  TrendingUp,
  Calendar,
  Trash2,
} from "lucide-react";
import { DashboardHeader, StatCard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { formatTarih } from "@/lib/mock-data";
import { useOperasyonStore } from "@/lib/store";
import { PERSONEL, getBirim } from "@/lib/auth";
import { generateAylıkFaaliyetRaporu } from "@/lib/pdf-rapor";
import { YeniEvrakFormu } from "@/components/shared/yeni-denetim-evrak-formu";
import type { SessionUser, Evrak, Vaka } from "@/lib/types";

type Module = "genel" | "evrak" | "raporlar" | "arsiv" | "personel";

export function IdariIslerDashboard({
  user,
  activeModule: externalModule,
  onModuleChange,
}: {
  user: SessionUser;
  activeModule?: string;
  onModuleChange?: (id: string) => void;
}) {
  const [internalModule, setInternalModule] = useState<Module>("genel");
  const aktifModul = (externalModule as Module) ?? internalModule;
  const setAktifModul = (m: Module) => {
    setInternalModule(m);
    onModuleChange?.(m);
  };
  const [yeniEvrakOpen, setYeniEvrakOpen] = useState(false);

  // Zustand store'dan canlı veri
  const EVRAKLAR = useOperasyonStore((s) => s.evraklar);
  const tumVakalar = useOperasyonStore((s) => s.vakalar);

  const istatistik = useMemo(() => {
    return {
      toplamEvrak: EVRAKLAR.length,
      bekleyen: EVRAKLAR.filter((e) => e.durum === "bekliyor").length,
      islenen: EVRAKLAR.filter((e) => e.durum === "isleniyor").length,
      tamamlanan: EVRAKLAR.filter((e) => e.durum === "tamamlandi").length,
      tumVakalar: tumVakalar.length,
      tumPersonel: PERSONEL.length,
    };
  }, [EVRAKLAR, tumVakalar]);

  return (
    <div>
      <DashboardHeader
        title="İdari İşler Yönetim Paneli"
        description={`Raporlama & kayıt · ${user.adSoyad} (${user.rol})`}
        icon={FileText}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/60 h-9"
              onClick={() => setYeniEvrakOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Yeni Evrak
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-9"
              onClick={async () => {
                const ayYil = new Date().toLocaleDateString("tr-TR", {
                  month: "long",
                  year: "numeric",
                });
                try {
                  toast({
                    title: "PDF hazırlanıyor...",
                    description: "Türkçe font yüklenip rapor oluşturuluyor.",
                  });
                  await generateAylıkFaaliyetRaporu({
                    ayYil: ayYil.charAt(0).toUpperCase() + ayYil.slice(1),
                    uretenAdSoyad: user.adSoyad,
                    uretenSicil: user.sicil,
                    uretenBirimAdi: getBirim(user.birimId).ad,
                    vakalar: tumVakalar,
                    evraklar: EVRAKLAR,
                    ekipler: [],
                    birimSayisi: 5,
                    personelSayisi: PERSONEL.length,
                  });
                  toast({
                    title: "Aylık rapor oluşturuldu ✓",
                    description: `PDF dosyası indirildi — ${ayYil} dönemi. Türkçe karakter desteği aktif.`,
                  });
                } catch (e) {
                  toast({
                    title: "Rapor üretilemedi",
                    description: String(e),
                    variant: "destructive",
                  });
                }
              }}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Aylık Rapor (PDF)
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-800 overflow-x-auto">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setAktifModul(m.id as Module)}
            className={cn(
              "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
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

      {aktifModul === "genel" && (
        <IdariGenelBakis istatistik={istatistik} evraklar={EVRAKLAR} />
      )}
      {aktifModul === "evrak" && (
        <EvrakModulu onYeniEvrak={() => setYeniEvrakOpen(true)} />
      )}
      {aktifModul === "raporlar" && (
        <RaporlarModulu
          user={user}
          tumVakalar={tumVakalar}
          EVRAKLAR={EVRAKLAR}
        />
      )}
      {aktifModul === "arsiv" && <ArsivModulu />}
      {aktifModul === "personel" && <PersonelModulu />}

      {/* Yeni Evrak Modalı — üst toolbar + Evrak modülünden tetiklenir */}
      <YeniEvrakFormu
        open={yeniEvrakOpen}
        onOpenChange={setYeniEvrakOpen}
      />
    </div>
  );
}

const MODULES = [
  { id: "genel", label: "Genel Bakış", ikon: Activity },
  { id: "evrak", label: "Evrak Kayıt", ikon: Inbox },
  { id: "raporlar", label: "Raporlar", ikon: FileText },
  { id: "arsiv", label: "Arşiv", ikon: Archive },
  { id: "personel", label: "Personel", ikon: Users },
] as const;

function IdariGenelBakis({
  istatistik,
  evraklar,
}: {
  istatistik: { toplamEvrak: number; bekleyen: number; islenen: number; tamamlanan: number; tumVakalar: number; tumPersonel: number };
  evraklar: Evrak[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Toplam Evrak" value={istatistik.toplamEvrak} icon={Inbox} />
        <StatCard label="Bekleyen" value={istatistik.bekleyen} icon={Clock} tone="yuksek" />
        <StatCard label="İşlenen" value={istatistik.islenen} icon={Activity} />
        <StatCard label="Tamamlanan" value={istatistik.tamamlanan} icon={CheckCircle2} tone="ok" />
        <StatCard label="Tüm Vakalar" value={istatistik.tumVakalar} icon={FolderCheck} />
        <StatCard label="Toplam Personel" value={istatistik.tumPersonel} icon={Users} />
      </div>

      {/* Bekleyen evrak listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              ÖNCELİKLİ BEKLEYEN EVRAKLAR
            </p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-2">
            {evraklar.filter((e) => e.durum === "bekliyor" || e.durum === "isleniyor").map((e) => (
              <div
                key={e.id}
                className="rounded-lg bg-slate-900/40 border border-slate-800 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-slate-500">{e.evrakNo}</p>
                    <p className="text-sm text-slate-100 mt-0.5 truncate">{e.konu}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {e.gonderen} → {e.alici}
                    </p>
                  </div>
                  <EvrakDurumRozet durum={e.durum} />
                </div>
                <p className="text-[10px] text-slate-600 mt-2 font-mono">
                  {formatTarih(e.tarih)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Birim bazlı personel dağılımı */}
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              BİRİM BAZLI PERSONEL DAĞILIMI
            </p>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2.5">
            {Object.entries(
              PERSONEL.reduce<Record<string, number>>((acc, p) => {
                acc[p.birimId] = (acc[p.birimId] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([birimId, sayi]) => {
              const birimAdlari: Record<string, string> = {
                operasyon: "Operasyon Merkezi",
                "fen-isleri": "Fen İşleri",
                zabita: "Zabıta",
                altyapi: "Altyapı",
                "idari-isler": "İdari İşler",
              };
              const max = 4;
              const pct = (sayi / max) * 100;
              return (
                <div key={birimId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{birimAdlari[birimId]}</span>
                    <span className="text-slate-400 font-mono">{sayi} kişi</span>
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
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              Toplam <span className="text-slate-300 font-semibold">{PERSONEL.length}</span> personel kayıtlı
            </p>
          </div>
        </div>
      </div>

      {/* Aylık evrak akışı trendi */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              AYLIK EVRAK AKIŞI — 2026
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Gelen + giden evrak sayıları</p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {[42, 51, 47, 58, 64, 61, 72, 68, 71].map((v, i) => {
            const ay = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
            const max = 72;
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
                  title={`${ay[i]}: ${v} evrak`}
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

function EvrakModulu({
  onYeniEvrak,
}: {
  onYeniEvrak?: () => void;
}) {
  const EVRAKLAR = useOperasyonStore((s) => s.evraklar);
  const [search, setSearch] = useState("");
  const filtreli = EVRAKLAR.filter(
    (e) =>
      e.konu.toLowerCase().includes(search.toLowerCase()) ||
      e.gonderen.toLowerCase().includes(search.toLowerCase()) ||
      e.alici.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Konu, gönderen, alıcı..."
            className="pl-8 h-9 bg-slate-800/40 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/60 rounded-lg"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:text-white"
          onClick={() => onYeniEvrak?.()}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Yeni Evrak
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtreli.map((e) => (
          <EvrakKarti key={e.id} evrak={e} />
        ))}
      </div>
    </div>
  );
}

function EvrakKarti({ evrak }: { evrak: Evrak }) {
  const deleteEvrak = useOperasyonStore((s) => s.deleteEvrak);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[10px] font-mono text-slate-500">{evrak.evrakNo}</p>
          <p className="text-sm font-medium text-white mt-0.5">{evrak.konu}</p>
        </div>
        <EvrakDurumRozet durum={evrak.durum} />
      </div>
      <div className="text-[11px] text-slate-400 space-y-1 mt-2">
        <p className="flex items-center gap-1.5">
          <Send className="w-3 h-3" />
          {evrak.gonderen} → {evrak.alici}
        </p>
        <p className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          {formatTarih(evrak.tarih)}
        </p>
        <p className="flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          {evrak.tip}
        </p>
      </div>
      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40"
          onClick={() =>
            toast({
              title: evrak.konu,
              description: `${evrak.evrakNo} · ${evrak.tip} · ${evrak.gonderen} → ${evrak.alici}`,
            })
          }
        >
          Detay
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          onClick={async () => {
            try {
              toast({ title: "Evrak PDF'i hazırlanıyor..." });
              const { generateEvrakPDF } = await import("@/lib/pdf-rapor");
              await generateEvrakPDF(evrak);
              toast({
                title: "Evrak PDF'i indirildi ✓",
                description: evrak.konu,
              });
            } catch (e) {
              toast({
                title: "Yazdırma hatası",
                description: String(e).slice(0, 100),
                variant: "destructive",
              });
            }
          }}
        >
          <Printer className="w-3 h-3 mr-1" />
          Yazdır
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Sil
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Evrakı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {evrak.evrakNo} — <span className="text-slate-200">{evrak.konu}</span>
              <br />
              Bu evrak kaydı kalıcı olarak silinecek. İşlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                deleteEvrak(evrak.id);
                setDeleteOpen(false);
                toast({
                  title: "Evrak silindi",
                  description: `${evrak.evrakNo} kaydı sistemden kaldırıldı.`,
                });
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EvrakDurumRozet({ durum }: { durum: string }) {
  const map: Record<string, { label: string; className: string }> = {
    bekliyor: {
      label: "BEKLEMEDE",
      className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    isleniyor: {
      label: "İŞLENİYOR",
      className: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    tamamlandi: {
      label: "TAMAMLANDI",
      className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
  };
  const item = map[durum] ?? map.bekliyor;
  return (
    <span
      className={cn(
        "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border",
        item.className
      )}
    >
      {item.label}
    </span>
  );
}

function RaporlarModulu({
  user,
  tumVakalar,
  EVRAKLAR,
}: {
  user: SessionUser;
  tumVakalar: Vaka[];
  EVRAKLAR: Evrak[];
}) {
  const RAPORLAR = [
    { id: "R-2026-09", baslik: "Eylül 2026 Aylık Faaliyet Raporu", tarih: "24.09.2026", durum: "TASLAK", tip: "Aylık" },
    { id: "R-2026-08", baslik: "Ağustos 2026 Faaliyet Raporu", tarih: "01.09.2026", durum: "TAMAMLANDI", tip: "Aylık" },
    { id: "R-2026-Q3", baslik: "2026 Q3 (Tem-Ağu-Eyl) Çeyrek Raporu", tarih: "01.10.2026", durum: "BEKLEMEDE", tip: "Çeyrek" },
    { id: "R-2026-V1", baslik: "Vatandaş Şikayet Değerlendirme Raporu", tarih: "15.09.2026", durum: "TAMAMLANDI", tip: "Özel" },
    { id: "R-2026-PER", baslik: "Personel Devam-Devamsızlık Raporu", tarih: "20.09.2026", durum: "TAMAMLANDI", tip: "Personel" },
    { id: "R-2026-FN", baslik: "Fen İşleri Saha Faaliyet Raporu", tarih: "22.09.2026", durum: "TASLAK", tip: "Birim" },
  ];

  const durumRenk: Record<string, string> = {
    TASLAK: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    TAMAMLANDI: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    BEKLEMEDE: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
        RAPOR ARŞİVİ — {RAPORLAR.length} RAPOR
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {RAPORLAR.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-mono text-slate-500">{r.id}</p>
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[r.durum])}>
                {r.durum}
              </span>
            </div>
            <p className="text-sm font-medium text-white mt-1 leading-snug">{r.baslik}</p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">{r.tarih}</span>
              <span className="text-[10px] text-slate-600 font-mono">{r.tip}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40 flex-1"
                onClick={() =>
                  toast({
                    title: r.baslik,
                    description: `${r.id} · ${r.tip} · ${r.tarih}`,
                  })
                }
              >
                Görüntüle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={async () => {
                  try {
                    toast({
                      title: "Rapor PDF'i hazırlanıyor...",
                      description: "Türkçe font yükleniyor, lütfen bekleyin.",
                    });
                    // Bugünün ay/yıl bilgisini Türkçe olarak hesapla
                    const bugun = new Date();
                    const ayYilStr = bugun.toLocaleDateString("tr-TR", {
                      month: "long",
                      year: "numeric",
                    });
                    const ayYil =
                      ayYilStr.charAt(0).toUpperCase() + ayYilStr.slice(1);
                    await generateAylıkFaaliyetRaporu({
                      ayYil: `${r.baslik} (${ayYil})`,
                      uretenAdSoyad: user.adSoyad,
                      uretenSicil: user.sicil,
                      uretenBirimAdi: getBirim(user.birimId).ad,
                      vakalar: tumVakalar,
                      evraklar: EVRAKLAR,
                      ekipler: [],
                      birimSayisi: 5,
                      personelSayisi: PERSONEL.length,
                    });
                    toast({
                      title: "Rapor PDF'i indirildi ✓",
                      description: r.baslik,
                    });
                  } catch (e) {
                    console.error("Yazdırma hatası:", e);
                    toast({
                      title: "Yazdırma hatası",
                      description: `Rapor üretilemedi. ${String(e).slice(0, 150)}`,
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Printer className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArsivModulu() {
  const ARSIV_KLASORLER = [
    { ad: "2026 Yılı Evrakları", sayi: 1847, renk: "blue" },
    { ad: "2025 Yılı Evrakları", sayi: 2412, renk: "slate" },
    { ad: "2024 Yılı Evrakları", sayi: 2198, renk: "slate" },
    { ad: "Valilik Yazışmaları", sayi: 412, renk: "amber" },
    { ad: "Birim İçi Yazışmalar", sayi: 824, renk: "cyan" },
    { ad: "Personel Özlük Dosyaları", sayi: 156, renk: "emerald" },
    { ad: "Meclis Kararları", sayi: 84, renk: "rose" },
    { ad: "İhale & Satınalma", sayi: 312, renk: "purple" },
  ];

  const renkMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/[0.06] text-blue-300",
    slate: "border-slate-700 bg-slate-800/40 text-slate-300",
    amber: "border-amber-500/30 bg-amber-500/[0.06] text-amber-300",
    cyan: "border-cyan-500/30 bg-cyan-500/[0.06] text-cyan-300",
    emerald: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
    rose: "border-rose-500/30 bg-rose-500/[0.06] text-rose-300",
    purple: "border-purple-500/30 bg-purple-500/[0.06] text-purple-300",
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
        DİJİTAL ARŞİV — {ARSIV_KLASORLER.length} KLASÖR
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ARSIV_KLASORLER.map((k) => (
          <button
            key={k.ad}
            className={cn(
              "rounded-lg border p-4 text-left hover:border-slate-500 transition-colors",
              renkMap[k.renk]
            )}
          >
            <Archive className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-xs font-medium leading-snug">{k.ad}</p>
            <p className="text-[11px] font-mono text-slate-500 mt-2">{k.sayi} belge</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonelModulu() {
  const birimAdlari: Record<string, string> = {
    operasyon: "Operasyon Merkezi",
    "fen-isleri": "Fen İşleri",
    zabita: "Zabıta",
    altyapi: "Altyapı",
    "idari-isler": "İdari İşler",
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
        PERSONEL LİSTESİ — {PERSONEL.length} KAYIT
      </p>
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Sicil</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Ad Soyad</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Birim</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Rol</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Demo Şifre</th>
            </tr>
          </thead>
          <tbody>
            {PERSONEL.map((p, i) => (
              <tr
                key={p.sicil}
                className={cn(
                  "border-b border-slate-800 hover:bg-slate-800/30",
                  i % 2 === 1 && "bg-slate-900/20"
                )}
              >
                <td className="px-3 py-2.5 text-xs font-mono text-slate-200">{p.sicil}</td>
                <td className="px-3 py-2.5 text-xs text-slate-100 font-medium">{p.adSoyad}</td>
                <td className="px-3 py-2.5 text-xs text-slate-400 hidden sm:table-cell">{birimAdlari[p.birimId]}</td>
                <td className="px-3 py-2.5 text-xs text-slate-300">{p.rol}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-500 hidden md:table-cell">{p.sifre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
