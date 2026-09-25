"use client";

import { useState } from "react";
import {
  Store,
  Plus,
  FileText,
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
import { useOperasyonStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import type { DenetimKaydi } from "@/lib/types";

// --- Zabıta Yeni Denetim Formu ---

export function YeniDenetimFormu({
  open,
  onOpenChange,
  ekipId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ekipId: string;
}) {
  const addDenetim = useOperasyonStore((s) => s.addDenetim);
  const [isletme, setIsletme] = useState("");
  const [adres, setAdres] = useState("");
  const [tip, setTip] = useState("Hijyen");
  const [sonuc, setSonuc] = useState<"uygun" | "uyari" | "ceza" | "kapatma">("uyari");
  const [not, setNot] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isletme.trim() || !adres.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "İşletme adı ve adres zorunludur.",
        variant: "destructive",
      });
      return;
    }

    const yeni: DenetimKaydi = {
      id: `D-2026-${Date.now().toString().slice(-5)}`,
      isletme: isletme.trim(),
      adres: adres.trim(),
      tip,
      sonuc,
      zaman: new Date().toISOString(),
      ekip: ekipId,
      not: not.trim() || undefined,
    };

    addDenetim(yeni);

    // Formu temizle
    setIsletme("");
    setAdres("");
    setTip("Hijyen");
    setSonuc("uyari");
    setNot("");
    onOpenChange(false);

    toast({
      title: "Denetim kaydı oluşturuldu ✓",
      description: `${yeni.id} — ${yeni.isletme} (${yeni.tip}) → ${yeni.sonuc.toUpperCase()}`,
    });
  }

  const sonucRenk: Record<string, string> = {
    uygun: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    uyari: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    ceza: "text-rose-300 border-rose-500/30 bg-rose-500/10",
    kapatma: "text-slate-300 border-slate-500/30 bg-slate-500/10",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-400" />
            Yeni Denetim Kaydı
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            İşletme denetim raporu oluşturun. Kayıt ekip {ekipId} tarafından yapıldı.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              İşletme Adı *
            </Label>
            <Input
              value={isletme}
              onChange={(e) => setIsletme(e.target.value)}
              placeholder="Örn: Market Yıldız"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Adres *
            </Label>
            <Input
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              placeholder="Mahalle + sokak + kapı no"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Denetim Tipi
              </Label>
              <Select value={tip} onValueChange={setTip}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  <SelectItem value="Hijyen" className="text-white focus:bg-slate-700">Hijyen</SelectItem>
                  <SelectItem value="İşgal" className="text-white focus:bg-slate-700">İşgal</SelectItem>
                  <SelectItem value="Ruhsat" className="text-white focus:bg-slate-700">Ruhsat</SelectItem>
                  <SelectItem value="Gürültü" className="text-white focus:bg-slate-700">Gürültü</SelectItem>
                  <SelectItem value="Çevre" className="text-white focus:bg-slate-700">Çevre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Sonuç
              </Label>
              <Select value={sonuc} onValueChange={(v) => setSonuc(v as typeof sonuc)}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  <SelectItem value="uygun" className="text-white focus:bg-slate-700">Uygun</SelectItem>
                  <SelectItem value="uyari" className="text-white focus:bg-slate-700">Uyarı</SelectItem>
                  <SelectItem value="ceza" className="text-white focus:bg-slate-700">Ceza</SelectItem>
                  <SelectItem value="kapatma" className="text-white focus:bg-slate-700">Kapatma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Not (opsiyonel)
            </Label>
            <Textarea
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Denetim notu, tespit edilen ihlal..."
              className="mt-1.5 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 min-h-[60px]"
            />
          </div>

          {/* Seçilen sonuc renkli önizleme */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sonuç:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${sonucRenk[sonuc]}`}>
              {sonuc.toUpperCase()}
            </span>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-300 hover:text-white"
            >
              Vazgeç
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Denetim Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- İdari İşler Yeni Evrak Formu ---

export function YeniEvrakFormu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addEvrak = useOperasyonStore((s) => s.addEvrak);
  const [evrakNo, setEvrakNo] = useState("");
  const [konu, setKonu] = useState("");
  const [gonderen, setGonderen] = useState("");
  const [alici, setAlici] = useState("");
  const [tip, setTip] = useState("İç Yazışma");
  const [durum, setDurum] = useState<"bekliyor" | "isleniyor" | "tamamlandi">("bekliyor");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!evrakNo.trim() || !konu.trim() || !gonderen.trim() || !alici.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Evrak no, konu, gönderen ve alıcı zorunludur.",
        variant: "destructive",
      });
      return;
    }

    const yeni = {
      id: `E-${Date.now()}`,
      evrakNo: evrakNo.trim(),
      konu: konu.trim(),
      gonderen: gonderen.trim(),
      alici: alici.trim(),
      tarih: new Date().toISOString(),
      durum,
      tip,
    };

    addEvrak(yeni);

    setEvrakNo("");
    setKonu("");
    setGonderen("");
    setAlici("");
    setTip("İç Yazışma");
    setDurum("bekliyor");
    onOpenChange(false);

    toast({
      title: "Evrak kaydı oluşturuldu ✓",
      description: `${yeni.evrakNo} — ${yeni.konu}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151E2E] border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Yeni Evrak Kaydı
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Yeni evrak kaydı oluşturun. Kayıt İdari İşler birimine işlenecek.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Evrak No *
              </Label>
              <Input
                value={evrakNo}
                onChange={(e) => setEvrakNo(e.target.value)}
                placeholder="2026/1030"
                className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Tip
              </Label>
              <Select value={tip} onValueChange={setTip}>
                <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151E2E] border-slate-700">
                  <SelectItem value="Resmi Gelen" className="text-white focus:bg-slate-700">Resmi Gelen</SelectItem>
                  <SelectItem value="Resmi Giden" className="text-white focus:bg-slate-700">Resmi Giden</SelectItem>
                  <SelectItem value="İç Yazışma" className="text-white focus:bg-slate-700">İç Yazışma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Konu *
            </Label>
            <Input
              value={konu}
              onChange={(e) => setKonu(e.target.value)}
              placeholder="Evrak konusu"
              className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Gönderen *
              </Label>
              <Input
                value={gonderen}
                onChange={(e) => setGonderen(e.target.value)}
                placeholder="Valilik / Müdürlük"
                className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Alıcı *
              </Label>
              <Input
                value={alici}
                onChange={(e) => setAlici(e.target.value)}
                placeholder="Belediye Başkanlığı"
                className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              İlk Durum
            </Label>
            <Select value={durum} onValueChange={(v) => setDurum(v as typeof durum)}>
              <SelectTrigger className="mt-1.5 h-10 bg-slate-900/40 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151E2E] border-slate-700">
                <SelectItem value="bekliyor" className="text-white focus:bg-slate-700">Bekliyor</SelectItem>
                <SelectItem value="isleniyor" className="text-white focus:bg-slate-700">İşleniyor</SelectItem>
                <SelectItem value="tamamlandi" className="text-white focus:bg-slate-700">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-300 hover:text-white"
            >
              Vazgeç
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Evrak Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
