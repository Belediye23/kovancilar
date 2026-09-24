"use client";

import { useState } from "react";
import {
  Wrench,
  Clock,
  Plus,
  MapPin,
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
import { MAHALLELER, KOVANCILAR_KOORDINAT } from "@/lib/mock-data";
import { useOperasyonStore, generateVakaId } from "@/lib/store";
import { getBirim } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import type { BirimId, Vaka, VakaOncelik, SessionUser } from "@/lib/types";

interface YeniVakaFormuProps {
  user: SessionUser;
  birimId: BirimId;
  defaultKategori?: string;
  kategoriler?: string[];
  onCreated?: (vaka: Vaka) => void;
}

// Birim bazlı kategori seçenekleri
const DEFAULT_KATEGORILER: Record<BirimId, string[]> = {
  operasyon: ["Koordinasyon", "Kırsal Ulaşım", "Acil Durum"],
  "fen-isleri": ["Yol", "Kaldırım", "Parke"],
  zabita: ["İşgal", "Gürültü", "Ruhsat", "Çevre"],
  altyapi: ["Su Kırılma", "Su Sızıntı", "Su Koku", "Kanalizasyon"],
  "idari-isler": ["Yazışma", "Özlük", "Arşiv"],
};

export function YeniVakaFormu({
  user,
  birimId,
  kategoriler,
  defaultKategori,
  onCreated,
}: YeniVakaFormuProps) {
  const addVaka = useOperasyonStore((s) => s.addVaka);
  const birim = getBirim(birimId);
  const kategoriListesi = kategoriler ?? DEFAULT_KATEGORILER[birimId] ?? ["Genel"];
  const ilkKategori = defaultKategori ?? kategoriListesi[0];

  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [adres, setAdres] = useState("");
  const [kategori, setKategori] = useState(ilkKategori);
  const [oncelik, setOncelik] = useState<VakaOncelik>("orta");

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

    // Kovancılar merkeze yakın küçük rastgele koordinat üret
    const koordinat = {
      lat: KOVANCILAR_KOORDINAT.lat + (Math.random() - 0.5) * 0.02,
      lng: KOVANCILAR_KOORDINAT.lng + (Math.random() - 0.5) * 0.03,
    };

    const yeni: Vaka = {
      id: generateVakaId(),
      birimId,
      baslik,
      aciklama,
      mahalle,
      adres,
      oncelik,
      durum: "yeni",
      olusturmaZamani: new Date().toISOString(),
      kategori,
      koordinat,
    };

    addVaka(yeni);
    onCreated?.(yeni);

    setBaslik("");
    setAciklama("");
    setMahalle("");
    setAdres("");
    setKategori(ilkKategori);
    setOncelik("orta");

    toast({
      title: "Vaka oluşturuldu",
      description: `${yeni.id} numaralı vaka sisteme eklendi, operasyon merkezine ve ${birim.ad} ekiplerine bildirildi.`,
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white">
            Yeni Vaka Oluştur
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 ml-1">
            {birim.ad.toUpperCase()}
          </span>
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
                  {kategoriListesi.map((k) => (
                    <SelectItem key={k} value={k} className="text-white focus:bg-slate-700">
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Öncelik
              </Label>
              <Select
                value={oncelik}
                onValueChange={(v) => setOncelik(v as VakaOncelik)}
              >
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
              Bildiren: {user.adSoyad} (Sicil: {user.sicil}) ·{" "}
              {new Date().toLocaleString("tr-TR")}
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Vaka Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
