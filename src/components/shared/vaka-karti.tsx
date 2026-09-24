"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Truck,
  Clock,
  FileText,
  ArrowRight,
  X,
  UserPlus,
  PlayCircle,
  CheckCircle2,
  Ban,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { formatTarih } from "@/lib/mock-data";
import { OncelikRozet, DurumRozet } from "@/components/app-shell";
import { useOperasyonStore } from "@/lib/store";
import { getBirim } from "@/lib/auth";
import type { Vaka, VakaDurum, BirimId } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// --- VakaKarti: Açılır kapanır, interaktif vaka kartı ---

export function VakaKarti({ vaka }: { vaka: Vaka }) {
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const { assignEkipToVaka, changeVakaDurum, closeVaka, ekipler } =
    useOperasyonStore();

  // Birim bazlı ekip listesi — kendi birimi + operasyon tümünü görür
  const userBirim: BirimId = vaka.birimId;
  const birimEkipler = useMemo(
    () => ekipler.filter((e) => e.birimId === userBirim),
    [ekipler, userBirim]
  );

  function handleDurumDegis(yeniDurum: VakaDurum) {
    changeVakaDurum(vaka.id, yeniDurum);
    toast({
      title: "Durum güncellendi",
      description: `${vaka.id} → ${yeniDurum.toUpperCase()}`,
    });
  }

  return (
    <>
      <div
        className={cn(
          "rounded-lg border bg-slate-800/30 transition-colors",
          vaka.oncelik === "kritik"
            ? "border-rose-500/30"
            : vaka.oncelik === "yuksek"
              ? "border-amber-500/25"
              : "border-slate-700/60"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-slate-800/40 transition-colors rounded-lg"
        >
          {/* Sol oncelik barı */}
          <div
            className={cn(
              "w-1 self-stretch rounded-full shrink-0",
              vaka.oncelik === "kritik" && "bg-rose-500",
              vaka.oncelik === "yuksek" && "bg-amber-500",
              vaka.oncelik === "orta" && "bg-blue-500",
              vaka.oncelik === "dusuk" && "bg-slate-500"
            )}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-mono text-slate-500">
                {vaka.id}
              </span>
              <OncelikRozet oncelik={vaka.oncelik} />
              <DurumRozet durum={vaka.durum} />
            </div>
            <p className="text-sm font-medium text-white leading-snug">
              {vaka.baslik}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
              <span className="text-slate-400">{vaka.kategori}</span>
              <span>·</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate">
                {vaka.mahalle} · {vaka.adres}
              </span>
            </div>
          </div>

          {open ? (
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          )}
        </button>

        {/* Detay paneli */}
        {open && (
          <div className="px-4 pb-3 pt-1 space-y-3 border-t border-slate-700/40">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                Açıklama
              </p>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {vaka.aciklama}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <InfoChip ikon={Clock} label="Tarih" value={formatTarih(vaka.olusturmaZamani)} />
              {vaka.atananEkip && (
                <InfoChip ikon={Truck} label="Ekip" value={vaka.atananEkip} />
              )}
              {vaka.atananPersonel && (
                <InfoChip ikon={User} label="Sorumlu" value={vaka.atananPersonel} />
              )}
              {vaka.koordinat && (
                <InfoChip
                  ikon={MapPin}
                  label="Koordinat"
                  value={`${vaka.koordinat.lat.toFixed(4)}°K, ${vaka.koordinat.lng.toFixed(4)}°D`}
                />
              )}
            </div>

            {/* Aksiyon butonları */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {/* Durum değiştirme — hızlı aksiyonlar */}
              {vaka.durum !== "atandi" && vaka.durum !== "devam-ediyor" && vaka.durum !== "cozuldu" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
                  onClick={() => handleDurumDegis("atandi")}
                >
                  <UserPlus className="w-3 h-3 mr-1.5" />
                  Atandı işaretle
                </Button>
              )}
              {(vaka.durum === "atandi" || vaka.durum === "yeni") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10"
                  onClick={() => handleDurumDegis("devam-ediyor")}
                >
                  <PlayCircle className="w-3 h-3 mr-1.5" />
                  Devam ediyor
                </Button>
              )}
              {vaka.durum !== "cozuldu" && vaka.durum !== "iptal" && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
                    onClick={() => setCloseOpen(true)}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    Kapat
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40"
                    onClick={() => setAssignOpen(true)}
                  >
                    <Truck className="w-3 h-3 mr-1.5" />
                    Ekip Ata
                  </Button>
                </>
              )}
              {vaka.durum !== "cozuldu" && vaka.durum !== "iptal" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                  onClick={() => {
                    changeVakaDurum(vaka.id, "iptal");
                    toast({
                      title: "Vaka iptal edildi",
                      description: `${vaka.id} iptal olarak işaretlendi.`,
                    });
                  }}
                >
                  <Ban className="w-3 h-3 mr-1.5" />
                  İptal
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() =>
                  toast({
                    title: "Detay görünümü",
                    description: `${vaka.id} detay sayfası yakında.`,
                  })
                }
              >
                <FileText className="w-3 h-3 mr-1.5" />
                Detay
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ekip atama modalı */}
      <EkipAtamaModal
        vaka={vaka}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        ekipler={birimEkipler}
        onAssign={(ekipId, personel) => {
          assignEkipToVaka(vaka.id, ekipId, personel);
          setAssignOpen(false);
          toast({
            title: "Ekip atandı",
            description: `${vaka.id} → ${ekipId}`,
          });
        }}
      />

      {/* Kapatma modalı */}
      <KapatmaModal
        vaka={vaka}
        open={closeOpen}
        onOpenChange={setCloseOpen}
        onClose={(not) => {
          closeVaka(vaka.id, not);
          setCloseOpen(false);
          toast({
            title: "Vaka kapatıldı ✓",
            description: `${vaka.id} çözüldü olarak işaretlendi.`,
          });
        }}
      />
    </>
  );
}

function InfoChip({
  ikon: Icon,
  label,
  value,
}: {
  ikon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5 p-2 rounded-md bg-slate-900/40 border border-slate-800">
      <Icon className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[9px] font-mono uppercase text-slate-600">{label}</p>
        <p className="text-[11px] text-slate-300 truncate">{value}</p>
      </div>
    </div>
  );
}

// --- Ekip Atama Modalı ---

function EkipAtamaModal({
  vaka,
  open,
  onOpenChange,
  ekipler,
  onAssign,
}: {
  vaka: Vaka;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ekipler: { id: string; ad: string; lider: string; durum: string; uyeSayisi: number }[];
  onAssign: (ekipId: string, personel: string) => void;
}) {
  const [selectedEkip, setSelectedEkip] = useState<string>(vaka.atananEkip ?? "");
  const [selectedPersonel, setSelectedPersonel] = useState<string>(
    vaka.atananPersonel ?? ""
  );

  const musaitEkipler = ekipler.filter((e) => e.durum !== "izinde");
  const seciliEkip = ekipler.find((e) => e.id === selectedEkip);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            Ekip Ata
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {vaka.id} — {vaka.baslik}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Ekip Seçin
            </Label>
            <Select
              value={selectedEkip}
              onValueChange={(v) => {
                setSelectedEkip(v);
                const e = ekipler.find((ek) => ek.id === v);
                if (e) setSelectedPersonel(e.lider);
              }}
            >
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue placeholder="Müsait ekibi seçin" />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700 max-h-72">
                {musaitEkipler.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Bu birimde müsait ekip yok.
                  </div>
                ) : (
                  musaitEkipler.map((e) => (
                    <SelectItem
                      key={e.id}
                      value={e.id}
                      className="text-white focus:bg-slate-700"
                    >
                      <span className="font-mono text-[10px] text-slate-500 mr-2">
                        {e.id}
                      </span>
                      {e.ad} · {e.lider}{" "}
                      <span
                        className={cn(
                          "ml-2 text-[9px] font-mono px-1 py-0.5 rounded",
                          e.durum === "musait"
                            ? "bg-blue-500/15 text-blue-300"
                            : e.durum === "gorevde"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                        )}
                      >
                        {e.durum === "musait"
                          ? "MÜSAİT"
                          : e.durum === "gorevde"
                            ? "GÖREVDE"
                            : "MOLADA"}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {seciliEkip && (
            <div className="p-3 rounded-md bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lider</span>
                <span>{seciliEkip.lider}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-500">Üye sayısı</span>
                <span>{seciliEkip.uyeSayisi}</span>
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Atanan Personel
            </Label>
            <Select value={selectedPersonel} onValueChange={setSelectedPersonel}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue placeholder="Personel seçin" />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                {seciliEkip && (
                  <SelectItem value={seciliEkip.lider} className="text-white focus:bg-slate-700">
                    {seciliEkip.lider} (Lider)
                  </SelectItem>
                )}
                <SelectItem value={selectedPersonel || "—"} className="text-white focus:bg-slate-700">
                  Manuel: {selectedPersonel || "—"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:text-white"
          >
            İptal
          </Button>
          <Button
            disabled={!selectedEkip}
            onClick={() => onAssign(selectedEkip, selectedPersonel)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Ekibe Ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Kapatma (Çözüldü) Modalı ---

function KapatmaModal({
  vaka,
  open,
  onOpenChange,
  onClose,
}: {
  vaka: Vaka;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: (not: string) => void;
}) {
  const [not, setNot] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Vakayı Kapat
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {vaka.id} — {vaka.baslik}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="p-3 rounded-md bg-amber-500/[0.06] border border-amber-500/20 text-xs text-amber-200/90">
            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
            Bu vaka "ÇÖZÜLDÜ" olarak işaretlenecek ve atanan ekip müsait
            duruma dönecek. Bu işlem geri alınamaz.
          </div>
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Çözüm Notu (zorunlu)
            </Label>
            <Textarea
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Yapılan müdahaleyi, kullanılan malzemeyi ve sonucu özetleyin..."
              className="mt-1.5 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 min-h-[100px] focus:border-blue-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:text-white"
          >
            Vazgeç
          </Button>
          <Button
            disabled={not.trim().length < 10}
            onClick={() => {
              onClose(not);
              setNot("");
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Çözüldü Olarak Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
