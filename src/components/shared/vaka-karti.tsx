"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Truck,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatTarih } from "@/lib/mock-data";
import { OncelikRozet, DurumRozet } from "@/components/app-shell";
import type { Vaka } from "@/lib/types";

export function VakaKarti({ vaka }: { vaka: Vaka }) {
  const [open, setOpen] = useState(false);

  return (
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
          {/* Üst satır: id + rozetler */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-500">
              {vaka.id}
            </span>
            <OncelikRozet oncelik={vaka.oncelik} />
            <DurumRozet durum={vaka.durum} />
          </div>
          {/* Başlık */}
          <p className="text-sm font-medium text-white leading-snug">
            {vaka.baslik}
          </p>
          {/* Alt satır: kategori + mahalle */}
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
            <span className="text-slate-400">{vaka.kategori}</span>
            <span>·</span>
            <MapPin className="w-3 h-3" />
            <span className="truncate">{vaka.mahalle} · {vaka.adres}</span>
          </div>
        </div>

        {/* Açma ikonu */}
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
            <p className="text-xs text-slate-300 leading-relaxed">
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

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-slate-300 hover:text-white hover:bg-slate-700/40"
            >
              <FileText className="w-3 h-3 mr-1.5" />
              Detay
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
            >
              Ekip Ata
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
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
