"use client";

import { useState } from "react";
import {
  Truck,
  Plus,
  Trash2,
  Users,
  Building2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useOperasyonStore } from "@/lib/store";
import { BIRIMLER, PERSONEL } from "@/lib/auth";
import type { BirimId, Ekip, Arac } from "@/lib/types";

// Kayıt Yönetimi modülü — Araç, Ekip, Mahalle ekle/sil

type Tab = "araclar" | "ekipler" | "mahalleler" | "personel";

export function KayitYonetimiModulu() {
  const [tab, setTab] = useState<Tab>("araclar");

  return (
    <div className="space-y-4">
      {/* Tab seçici */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800">
        {[
          { id: "araclar", label: "Araç Filosu", ikon: Truck },
          { id: "ekipler", label: "Ekipler", ikon: Users },
          { id: "mahalleler", label: "Mahalleler", ikon: Building2 },
          { id: "personel", label: "Personel", ikon: PlusCircle },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-blue-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-100"
            )}
          >
            <t.ikon className="w-3.5 h-3.5 inline-block mr-1.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "araclar" && <AracYonetimi />}
      {tab === "ekipler" && <EkipYonetimi />}
      {tab === "mahalleler" && <MahalleYonetimi />}
      {tab === "personel" && <PersonelYonetimi />}
    </div>
  );
}

// --- Araç Yönetimi ---

function AracYonetimi() {
  const araclar = useOperasyonStore((s) => s.araclar);
  const addArac = useOperasyonStore((s) => s.addArac);
  const deleteArac = useOperasyonStore((s) => s.deleteArac);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [plaka, setPlaka] = useState("");
  const [tur, setTur] = useState("Kamyonet 4x4");
  const [birimId, setBirimId] = useState<BirimId>("fen-isleri");

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!plaka.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Plaka zorunludur.",
        variant: "destructive",
      });
      return;
    }
    const yeni: Arac = {
      id: `ARAC-${Date.now()}`,
      plaka: plaka.trim().toUpperCase(),
      tur,
      birimId,
      durum: "musait",
      km: 0,
    };
    addArac(yeni);
    setPlaka("");
    toast({
      title: "Araç eklendi ✓",
      description: `${yeni.plaka} (${yeni.tur}) — ${BIRIMLER.find((b) => b.id === birimId)?.ad}`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Yeni Araç Ekle
        </p>
        <form onSubmit={handleEkle} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Plaka *</Label>
            <Input
              value={plaka}
              onChange={(e) => setPlaka(e.target.value)}
              placeholder="34 ABC 123"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Tür</Label>
            <Select value={tur} onValueChange={setTur}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                <SelectItem value="Kamyonet 4x4" className="text-white focus:bg-slate-700">Kamyonet 4x4</SelectItem>
                <SelectItem value="Kamyon (Yük)" className="text-white focus:bg-slate-700">Kamyon (Yük)</SelectItem>
                <SelectItem value="Mini İş Makinesi" className="text-white focus:bg-slate-700">Mini İş Makinesi</SelectItem>
                <SelectItem value="Ekip Aracı" className="text-white focus:bg-slate-700">Ekip Aracı</SelectItem>
                <SelectItem value="Su Saha Arazi" className="text-white focus:bg-slate-700">Su Saha Arazi</SelectItem>
                <SelectItem value="Kanal Aracı" className="text-white focus:bg-slate-700">Kanal Aracı</SelectItem>
                <SelectItem value="Motosiklet" className="text-white focus:bg-slate-700">Motosiklet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Birim</Label>
            <Select value={birimId} onValueChange={(v) => setBirimId(v as BirimId)}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                {BIRIMLER.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-white focus:bg-slate-700">
                    {b.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ekle
            </Button>
          </div>
        </form>
      </div>

      {/* Araç listesi */}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Plaka</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Tür</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Birim</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Durum</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">KM</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {araclar.map((arac, i) => {
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
                operasyon: "Operasyon",
                "idari-isler": "İdari İşler",
              };
              return (
                <tr key={arac.id} className={cn("border-b border-slate-800", i % 2 === 1 && "bg-slate-900/20")}>
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
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => setDeleteId(arac.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Silme onayı */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Aracı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu araç kaydı kalıcı olarak silinecek. İşlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) {
                  deleteArac(deleteId);
                  toast({ title: "Araç silindi", description: "Kayıt sistemden kaldırıldı." });
                  setDeleteId(null);
                }
              }}
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Ekip Yönetimi ---

function EkipYonetimi() {
  const ekipler = useOperasyonStore((s) => s.ekipler);
  const addEkip = useOperasyonStore((s) => s.addEkip);
  const deleteEkip = useOperasyonStore((s) => s.deleteEkip);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [ad, setAd] = useState("");
  const [lider, setLider] = useState("");
  const [uyeSayisi, setUyeSayisi] = useState("3");
  const [birimId, setBirimId] = useState<BirimId>("fen-isleri");

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!ad.trim() || !lider.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Ekip adı ve lider zorunludur.",
        variant: "destructive",
      });
      return;
    }
    const birimKisa = BIRIMLER.find((b) => b.id === birimId)?.kisaAd ?? "";
    const yeni: Ekip = {
      id: `${birimKisa.toUpperCase().replace("İ", "I")}-EKIP-${Date.now().toString().slice(-4)}`,
      birimId,
      ad: ad.trim(),
      lider: lider.trim(),
      uyeSayisi: parseInt(uyeSayisi, 10) || 1,
      durum: "musait",
      konum: "Merkez Şefliği",
    };
    addEkip(yeni);
    setAd("");
    setLider("");
    setUyeSayisi("3");
    toast({
      title: "Ekip eklendi ✓",
      description: `${yeni.ad} (${yeni.lider}) — ${BIRIMLER.find((b) => b.id === birimId)?.ad}`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Yeni Ekip Ekle
        </p>
        <form onSubmit={handleEkle} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Ekip Adı *</Label>
            <Input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Fen Saha Ekip 4"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Lider *</Label>
            <Input
              value={lider}
              onChange={(e) => setLider(e.target.value)}
              placeholder="Ad Soyad"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Üye Sayısı</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={uyeSayisi}
              onChange={(e) => setUyeSayisi(e.target.value)}
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white focus:border-blue-500"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Birim</Label>
            <Select value={birimId} onValueChange={(v) => setBirimId(v as BirimId)}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                {BIRIMLER.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-white focus:bg-slate-700">
                    {b.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ekip Ekle
            </Button>
          </div>
        </form>
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
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {BIRIMLER.find((b) => b.id === ekip.birimId)?.ad}
                  </p>
                </div>
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[ekip.durum])}>
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
              <Button
                size="sm"
                variant="ghost"
                className="w-full h-7 mt-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                onClick={() => setDeleteId(ekip.id)}
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                Sil
              </Button>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Ekibi Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu ekip kaydı kalıcı olarak silinecek. İşlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) {
                  deleteEkip(deleteId);
                  toast({ title: "Ekip silindi", description: "Kayıt sistemden kaldırıldı." });
                  setDeleteId(null);
                }
              }}
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Mahalle Yönetimi ---

function MahalleYonetimi() {
  const mahalleler = useOperasyonStore((s) => s.mahalleler);
  const addMahalle = useOperasyonStore((s) => s.addMahalle);
  const deleteMahalle = useOperasyonStore((s) => s.deleteMahalle);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [ad, setAd] = useState("");
  const [nufus, setNufus] = useState("1000");

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!ad.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Mahalle adı zorunludur.",
        variant: "destructive",
      });
      return;
    }
    const yeni = {
      id: `m${Date.now()}`,
      ad: ad.trim(),
      nufus: parseInt(nufus, 10) || 0,
      vakaSayisi: 0,
    };
    addMahalle(yeni);
    setAd("");
    setNufus("1000");
    toast({
      title: "Mahalle eklendi ✓",
      description: `${yeni.ad} (nüfus ${yeni.nufus})`,
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-4">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          Yeni Mahalle Ekle
        </p>
        <form onSubmit={handleEkle} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Mahalle Adı *</Label>
            <Input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Örn: Yeni Mahalle"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Nüfus</Label>
            <Input
              type="number"
              min="0"
              value={nufus}
              onChange={(e) => setNufus(e.target.value)}
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Ekle
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Mahalle</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Nüfus</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Vaka Sayısı</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {mahalleler.map((m, i) => (
              <tr key={m.id} className={cn("border-b border-slate-800", i % 2 === 1 && "bg-slate-900/20")}>
                <td className="px-3 py-2.5 text-slate-200 text-xs font-medium">{m.ad}</td>
                <td className="px-3 py-2.5 text-right text-slate-300 text-xs font-mono">{m.nufus.toLocaleString("tr-TR")}</td>
                <td className="px-3 py-2.5 text-right text-slate-400 text-xs font-mono">{m.vakaSayisi}</td>
                <td className="px-3 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    onClick={() => setDeleteId(m.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Mahalleyi Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu mahalle kaydı kalıcı olarak silinecek. İşlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) {
                  deleteMahalle(deleteId);
                  toast({ title: "Mahalle silindi", description: "Kayıt sistemden kaldırıldı." });
                  setDeleteId(null);
                }
              }}
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Personel Yönetimi (salt-okunur liste) ---

function PersonelYonetimi() {
  return (
    <div className="space-y-3">
      <div className="rounded-md bg-amber-500/[0.06] border border-amber-500/20 p-3 text-xs text-amber-200/90">
        <strong className="text-amber-200">Bilgi:</strong> Personel kayıtları sistem
        yöneticisi tarafından belirlenmiştir (her birimde 1 yönetici, sicil 0001).
        Yeni personel eklemek için kod seviyesinde değişiklik gerekir. Şifre
        değişikliği giriş ekranındaki "Şifre Değiştir" butonundan yapılır.
      </div>

      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Sicil</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Ad Soyad</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Birim</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Rol</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Varsayılan Şifre</th>
            </tr>
          </thead>
          <tbody>
            {PERSONEL.map((p, i) => (
              <tr key={p.birimId} className={cn("border-b border-slate-800", i % 2 === 1 && "bg-slate-900/20")}>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-200">{p.sicil}</td>
                <td className="px-3 py-2.5 text-xs text-slate-100 font-medium">{p.adSoyad}</td>
                <td className="px-3 py-2.5 text-xs text-slate-400 hidden sm:table-cell">
                  {BIRIMLER.find((b) => b.id === p.birimId)?.ad}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-300">{p.rol}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-500 hidden md:table-cell">
                  •••• (değiştirilebilir)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
