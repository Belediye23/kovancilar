"use client";

import { useState } from "react";
import {
  FileCheck,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Store,
  ShoppingBag,
  Eye,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { MAHALLELER, formatTarih } from "@/lib/mock-data";
import type { Ruhsat, PazarYeriTezgah, RuhsatTur } from "@/lib/types";

// --- Ruhsatlar Modülü ---

export function RuhsatlarModulu() {
  const ruhsatlar = useOperasyonStore((s) => s.ruhsatlar);
  const addRuhsat = useOperasyonStore((s) => s.addRuhsat);
  const updateRuhsatDurum = useOperasyonStore((s) => s.updateRuhsatDurum);
  const deleteRuhsat = useOperasyonStore((s) => s.deleteRuhsat);
  const [yeniOpen, setYeniOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtreli = filter === "all" ? ruhsatlar : ruhsatlar.filter((r) => r.tur === filter);

  const turEtiket: Record<string, string> = {
    "isyeri-acma": "İşyeri Açma",
    etkinlik: "Etkinlik",
    "yapi-insaat": "Yapı/İnşaat",
    "pazar-yeri": "Pazar Yeri",
  };

  const durumRenk: Record<string, string> = {
    beklemede: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    inceleniyor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    onaylandi: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    reddedildi: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    iptal: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  };
  const durumEtiket: Record<string, string> = {
    beklemede: "BEKLEMEDE",
    inceleniyor: "İNCELENİYOR",
    onaylandi: "ONAYLANDI",
    reddedildi: "REDDEDİLDİ",
    iptal: "İPTAL",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "isyeri-acma", "etkinlik", "yapi-insaat"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors",
                filter === f
                  ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                  : "border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
              )}
            >
              {f === "all" ? "Tümü" : turEtiket[f]}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => setYeniOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Yeni Başvuru
        </Button>
      </div>

      {/* Ruhsat listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtreli.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-slate-500">{r.basvuruNo}</p>
                <p className="text-sm font-medium text-white mt-0.5 truncate">{r.baslik}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{turEtiket[r.tur]}</p>
              </div>
              <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ml-2", durumRenk[r.durum])}>
                {durumEtiket[r.durum]}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Başvuran</span>
                <span className="text-slate-200">{r.basvuran}</span>
              </div>
              <div className="flex justify-between">
                <span>İşletme</span>
                <span className="text-slate-200">{r.isletmeAdi}</span>
              </div>
              <div className="flex justify-between">
                <span>Telefon</span>
                <span className="text-slate-200 font-mono">{r.telefon}</span>
              </div>
              <div className="flex justify-between">
                <span>Mahalle</span>
                <span className="text-slate-200">{r.mahalle}</span>
              </div>
              <div className="flex justify-between">
                <span>Faaliyet</span>
                <span className="text-slate-200 truncate max-w-[180px]">{r.faaliyetKonusu}</span>
              </div>
              <div className="flex justify-between">
                <span>Ücret</span>
                <span className="text-slate-200 font-mono">{r.ucret}₺</span>
              </div>
              {r.not && (
                <p className="mt-1 p-1.5 rounded bg-slate-900/40 text-[10px] text-slate-300">
                  📝 {r.not}
                </p>
              )}
            </div>

            {/* Aksiyon butonları */}
            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800">
              {r.durum !== "onaylandi" && r.durum !== "reddedildi" && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
                    onClick={() => {
                      updateRuhsatDurum(r.id, "onaylandi");
                      toast({ title: "Ruhsat onaylandı ✓", description: `${r.basvuruNo} — ${r.isletmeAdi}` });
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                    onClick={() => {
                      updateRuhsatDurum(r.id, "reddedildi", "Başvuru değerlendirildi ve reddedildi.");
                      toast({ title: "Ruhsat reddedildi", description: `${r.basvuruNo}`, variant: "destructive" });
                    }}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reddet
                  </Button>
                  {r.durum === "beklemede" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
                      onClick={() => {
                        updateRuhsatDurum(r.id, "inceleniyor");
                        toast({ title: "İncelemeye alındı", description: `${r.basvuruNo}` });
                      }}
                    >
                      İncele
                    </Button>
                  )}
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ml-auto"
                onClick={() => setDeleteId(r.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtreli.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Bu filtreye uygun ruhsat başvurusu yok.</p>
        </div>
      )}

      {/* Yeni Başvuru Modalı */}
      <YeniRuhsatFormu open={yeniOpen} onOpenChange={setYeniOpen} onAdd={addRuhsat} />

      {/* Silme onayı */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Ruhsat Başvurusunu Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu başvuru kalıcı olarak silinecek. İşlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                if (deleteId) {
                  deleteRuhsat(deleteId);
                  toast({ title: "Başvuru silindi" });
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

function YeniRuhsatFormu({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (r: Ruhsat) => void;
}) {
  const [basvuran, setBasvuran] = useState("");
  const [isletmeAdi, setIsletmeAdi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [adres, setAdres] = useState("");
  const [faaliyetKonusu, setFaaliyetKonusu] = useState("");
  const [tur, setTur] = useState<RuhsatTur>("isyeri-acma");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!basvuran || !isletmeAdi || !mahalle || !adres) {
      toast({ title: "Eksik bilgi", description: "Zorunlu alanları doldurun.", variant: "destructive" });
      return;
    }
    const turEtiketler: Record<string, string> = {
      "isyeri-acma": "İşyeri",
      etkinlik: "Etkinlik",
      "yapi-insaat": "Tadilat",
    };
    const yeni: Ruhsat = {
      id: `R-2026-${Date.now().toString().slice(-5)}`,
      basvuruNo: `2026/${tur === "etkinlik" ? "E" : tur === "yapi-insaat" ? "Y" : "R"}/${Date.now().toString().slice(-4)}`,
      tur,
      baslik: `${isletmeAdi} — ${mahalle} Mah.`,
      basvuran,
      isletmeAdi,
      telefon: telefon || "—",
      mahalle,
      adres,
      faaliyetKonusu: faaliyetKonusu || "—",
      durum: "beklemede",
      basvuruTarihi: new Date().toISOString(),
      ucret: tur === "etkinlik" ? 1000 : tur === "yapi-insaat" ? 2000 : 500,
    };
    onAdd(yeni);
    setBasvuran(""); setIsletmeAdi(""); setTelefon(""); setMahalle(""); setAdres(""); setFaaliyetKonusu(""); setTur("isyeri-acma");
    onOpenChange(false);
    toast({ title: "Başvuru oluşturuldu ✓", description: `${yeni.basvuruNo} — ${isletmeAdi}` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            Yeni Ruhsat Başvurusu
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            İşyeri açma, etkinlik veya yapı ruhsatı başvurusu oluşturun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Ruhsat Türü</Label>
            <Select value={tur} onValueChange={(v) => setTur(v as RuhsatTur)}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                <SelectItem value="isyeri-acma" className="text-white focus:bg-slate-700">İşyeri Açma Ruhsatı</SelectItem>
                <SelectItem value="etkinlik" className="text-white focus:bg-slate-700">Geçici Etkinlik Ruhsatı</SelectItem>
                <SelectItem value="yapi-insaat" className="text-white focus:bg-slate-700">Yapı/İnşaat Ruhsatı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Başvuran Adı *</Label>
              <Input value={basvuran} onChange={(e) => setBasvuran(e.target.value)} placeholder="Ad Soyad" className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white" />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">İşletme/Yer Adı *</Label>
              <Input value={isletmeAdi} onChange={(e) => setIsletmeAdi(e.target.value)} placeholder="İşletme adı" className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Telefon</Label>
              <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="05xx xxx xx xx" className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white font-mono" />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Mahalle *</Label>
              <Select value={mahalle} onValueChange={setMahalle}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue placeholder="Mahalle seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  {MAHALLELER.map((m) => (
                    <SelectItem key={m.id} value={m.ad} className="text-white focus:bg-slate-700">{m.ad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Adres *</Label>
            <Input value={adres} onChange={(e) => setAdres(e.target.value)} placeholder="Cadde/Sokak, kapı no" className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white" />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">Faaliyet Konusu</Label>
            <Textarea value={faaliyetKonusu} onChange={(e) => setFaaliyetKonusu(e.target.value)} placeholder="Faaliyet detayı..." className="mt-1.5 bg-slate-900/40 border-slate-700 text-white min-h-[60px]" />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300 hover:text-white">Vazgeç</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Başvuru Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Pazar Yeri Modülü ---

export function PazarYeriModulu() {
  const tezgahlar = useOperasyonStore((s) => s.pazarTezgahlari);
  const addPazarTezgah = useOperasyonStore((s) => s.addPazarTezgah);
  const updatePazarTezgah = useOperasyonStore((s) => s.updatePazarTezgah);
  const deletePazarTezgah = useOperasyonStore((s) => s.deletePazarTezgah);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtreli = filter === "all" ? tezgahlar : tezgahlar.filter((t) => t.pazarGunu === filter);
  const gunler = ["Pazartesi", "Perşembe", "Pazar"];

  const durumRenk: Record<string, string> = {
    aktif: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    pasif: "text-slate-400 bg-slate-500/10 border-slate-500/30",
    beklemede: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  };
  const durumEtiket: Record<string, string> = {
    aktif: "AKTİF",
    pasif: "PASİF",
    beklemede: "BEKLEMEDE",
  };

  // İstatistikler
  const toplamTezgah = tezgahlar.length;
  const aktifTezgah = tezgahlar.filter((t) => t.durum === "aktif").length;
  const odenmemis = tezgahlar.filter((t) => !t.odendi).length;
  const toplamGelir = tezgahlar.filter((t) => t.odendi).reduce((t, x) => t + x.ucret, 0);

  return (
    <div className="space-y-4">
      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3">
          <p className="text-[10px] font-mono uppercase text-slate-500">Toplam Tezgah</p>
          <p className="text-2xl font-bold text-white mt-1">{toplamTezgah}</p>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3">
          <p className="text-[10px] font-mono uppercase text-slate-500">Aktif</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{aktifTezgah}</p>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3">
          <p className="text-[10px] font-mono uppercase text-slate-500">Ödenmemiş</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{odenmemis}</p>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/30 p-3">
          <p className="text-[10px] font-mono uppercase text-slate-500">Toplam Gelir</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{toplamGelir}₺</p>
        </div>
      </div>

      {/* Filtre + Yeni buton */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilter("all")} className={cn("px-3 py-1.5 text-xs rounded-full border", filter === "all" ? "bg-blue-600/15 border-blue-500/40 text-blue-300" : "border-slate-700 text-slate-400 hover:text-slate-200")}>
            Tümü
          </button>
          {gunler.map((g) => (
            <button key={g} onClick={() => setFilter(g)} className={cn("px-3 py-1.5 text-xs rounded-full border", filter === g ? "bg-blue-600/15 border-blue-500/40 text-blue-300" : "border-slate-700 text-slate-400 hover:text-slate-200")}>
              {g}
            </button>
          ))}
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={() => {
          const yeni: PazarYeriTezgah = {
            id: `P-${Date.now().toString().slice(-4)}`,
            tezgahNo: String(tezgahlar.length + 1),
            pazarGunu: "Pazartesi",
            esnafAdi: "",
            faaliyet: "",
            ucret: 50,
            odendi: false,
            durum: "beklemede",
          };
          addPazarTezgah(yeni);
          toast({ title: "Tezgah eklendi", description: `No: ${yeni.tezgahNo}` });
        }}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tezgah Ekle
        </Button>
      </div>

      {/* Tezgah listesi — tablo */}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 border-b border-slate-700">
            <tr>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">No</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Gün</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden sm:table-cell">Esnaf</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2 hidden md:table-cell">Faaliyet</th>
              <th className="text-left text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Durum</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Ücret</th>
              <th className="text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">Ödendi</th>
              <th className="text-right text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtreli.map((t, i) => (
              <tr key={t.id} className={cn("border-b border-slate-800 hover:bg-slate-800/30", i % 2 === 1 && "bg-slate-900/20")}>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-200">{t.tezgahNo}</td>
                <td className="px-3 py-2.5 text-xs text-slate-300">{t.pazarGunu}</td>
                <td className="px-3 py-2.5 text-xs text-slate-200 hidden sm:table-cell">{t.esnafAdi || "—"}</td>
                <td className="px-3 py-2.5 text-xs text-slate-400 hidden md:table-cell">{t.faaliyet || "—"}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", durumRenk[t.durum])}>
                    {durumEtiket[t.durum]}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-mono text-slate-200">{t.ucret}₺</td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    onClick={() => updatePazarTezgah(t.id, { odendi: !t.odendi })}
                    className={cn(
                      "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                      t.odendi ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "border-slate-600 text-slate-600 hover:border-slate-400"
                    )}
                  >
                    {t.odendi && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => setDeleteId(t.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Silme onayı */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Tezgahı Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">Bu tezgah kaydı kalıcı olarak silinecek.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-slate-300 hover:text-white">Vazgeç</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { if (deleteId) { deletePazarTezgah(deleteId); toast({ title: "Tezgah silindi" }); setDeleteId(null); } }}>
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
