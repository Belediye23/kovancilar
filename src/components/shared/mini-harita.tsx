"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Crosshair, Navigation } from "lucide-react";
import { KOVANCILAR_KOORDINAT } from "@/lib/mock-data";

// Leaflet'i SSR'de yükleme — 'use client' + dynamic import
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false, loading: () => <Yukleniyor height={280} /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

// Leaflet CSS
import "leaflet/dist/leaflet.css";

interface MiniHaritaProps {
  noktalar: {
    lat: number;
    lng: number;
    etiket?: string;
    oncelik?: string;
  }[];
  height?: number | string;
  className?: string;
}

// Renk eşleme — oncelik -> leaflet fill color
const ONCELIK_RENK: Record<string, string> = {
  kritik: "#f43f5e",
  yuksek: "#f59e0b",
  orta: "#3b82f6",
  dusuk: "#64748b",
};

export function MiniHarita({
  noktalar,
  height = 280,
  className,
}: MiniHaritaProps) {
  const h = typeof height === "number" ? height : 280;
  const merkezM = KOVANCILAR_KOORDINAT;

  // Kovancılar merkezli, tüm noktaları kapsayan bounds hesapla
  const bounds = useMemo(() => {
    if (noktalar.length === 0) {
      // Varsayılan: Kovancılar merkezde, ufak bir alan (~1km)
      return [
        [merkezM.lat - 0.008, merkezM.lng - 0.012],
        [merkezM.lat + 0.008, merkezM.lng + 0.012],
      ] as [[number, number], [number, number]];
    }
    const lats = noktalar.map((n) => n.lat);
    const lngs = noktalar.map((n) => n.lng);
    // Kovancılar merkezini de dahil et — her zaman görünsün
    const minLat = Math.min(...lats, merkezM.lat - 0.005);
    const maxLat = Math.max(...lats, merkezM.lat + 0.005);
    const minLng = Math.min(...lngs, merkezM.lng - 0.008);
    const maxLng = Math.max(...lngs, merkezM.lng + 0.008);
    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ] as [[number, number], [number, number]];
  }, [noktalar, merkezM.lat, merkezM.lng]);

  return (
    <div
      className="relative rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900/40"
      style={{ height: h }}
    >
      <MapContainer
        center={[merkezM.lat, merkezM.lng]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", background: "#0F1623" }}
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Belediye binası merkez nokta */}
        <CircleMarker
          center={[merkezM.lat, merkezM.lng]}
          radius={10}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.4, weight: 3 }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold">KOVANCILAR BELEDİYESİ</p>
              <p className="text-slate-600">Saha Operasyon Merkezi</p>
              <p className="font-mono text-[10px] mt-1">
                {merkezM.lat}°K · {merkezM.lng}°D
              </p>
            </div>
          </Popup>
        </CircleMarker>
        {/* Vaka noktaları */}
        {noktalar.map((n, i) => {
          const color = ONCELIK_RENK[n.oncelik ?? "orta"] ?? ONCELIK_RENK.orta;
          return (
            <CircleMarker
              key={i}
              center={[n.lat, n.lng]}
              radius={7}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs max-w-[220px]">
                  <p className="font-mono text-[10px] text-slate-500">
                    {n.etiket ?? "Vaka"}
                  </p>
                  <p className="font-bold mt-1">
                    {n.oncelik?.toUpperCase() ?? "ORTA"} öncelik
                  </p>
                  <p className="text-slate-600 font-mono text-[10px] mt-1">
                    {n.lat.toFixed(4)}°K · {n.lng.toFixed(4)}°D
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Köşe UI overlay */}
      <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-mono text-slate-300">
          KOVANCILAR / ELAZIĞ
        </span>
      </div>

      <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
        <Crosshair className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] font-mono text-slate-300">
          {merkezM.lat}°K · {merkezM.lng}°D
        </span>
      </div>

      <div className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
        <Navigation className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-mono text-slate-300">
          {noktalar.length} NOKTA · CANLI
        </span>
      </div>

      {/* Lejant */}
      <div className="absolute bottom-2 left-2 z-[1000] flex flex-wrap items-center gap-2 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
        <LegendItem color="#f43f5e" label="Kritik" />
        <LegendItem color="#f59e0b" label="Yüksek" />
        <LegendItem color="#3b82f6" label="Orta" />
        <LegendItem color="#64748b" label="Düşük" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function Yukleniyor({ height }: { height: number }) {
  return (
    <div
      className="rounded-xl border border-slate-700/60 bg-slate-900/40 flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-6 h-6 mx-auto mb-2 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-[10px] font-mono text-slate-500">Harita yükleniyor...</p>
      </div>
    </div>
  );
}
