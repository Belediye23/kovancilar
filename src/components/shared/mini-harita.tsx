"use client";

import dynamic from "next/dynamic";
import { MapPin, Crosshair, Navigation } from "lucide-react";
import { KOVANCILAR_KOORDINAT, MAHALLE_KOORDINATLARI, MAHALLELER } from "@/lib/mock-data";
import "leaflet/dist/leaflet.css";

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
const Rectangle = dynamic(
  () => import("react-leaflet").then((m) => m.Rectangle),
  { ssr: false }
);

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

// Kovancılar ilçe sınırları — harita BU ALANIN DIŞINA ÇIKAMAZ
// Merkez: 38.72°K, 39.87°D
// Tüm mahalleler bu sınırlar içinde
const KOVANCILAR_BOUNDS: [[number, number], [number, number]] = [
  [38.700, 39.840], // Güney-batı köşesi
  [38.740, 39.900], // Kuzey-doğu köşesi
];

export function MiniHarita({
  noktalar,
  height = 280,
  className,
}: MiniHaritaProps) {
  const h = typeof height === "number" ? height : 280;
  const merkezM = KOVANCILAR_KOORDINAT;

  return (
    <div
      className="relative rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900/40"
      style={{ height: h }}
    >
      <MapContainer
        center={[merkezM.lat, merkezM.lng]}
        zoom={16}
        minZoom={14}
        maxZoom={19}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ width: "100%", height: "100%", background: "#0F1623" }}
        maxBounds={KOVANCILAR_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Kovancılar ilçe sınırı — görsel vurgu (rectangle + popup) */}
        <Rectangle
          bounds={KOVANCILAR_BOUNDS}
          pathOptions={{
            color: "#3b82f6",
            weight: 2,
            opacity: 0.6,
            fillColor: "#3b82f6",
            fillOpacity: 0.05,
            dashArray: "5, 10",
          }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-base">📍 KOVANCILAR İLÇESİ</p>
              <p className="text-slate-600">Elazığ İli · Kovancılar İlçesi</p>
              <p className="text-slate-600 mt-1">
                Toplam Nüfus: {MAHALLELER.reduce((t, m) => t + m.nufus, 0).toLocaleString("tr-TR")} kişi
              </p>
              <p className="text-slate-600">
                Mahalle Sayısı: {MAHALLELER.length}
              </p>
              <p className="font-mono text-[10px] mt-1 text-slate-500">
                Merkez: 38.72° K · 39.87° D
              </p>
            </div>
          </Popup>
        </Rectangle>

        {/* Belediye binası merkez nokta — Kovancılar ilçe merkezi */}
        <CircleMarker
          center={[merkezM.lat, merkezM.lng]}
          radius={11}
          pathOptions={{
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.5,
            weight: 3,
          }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-base">🏛️ KOVANCILAR BELEDİYESİ</p>
              <p className="text-slate-600">Saha Operasyon Merkezi</p>
              <p className="text-slate-600 mt-1">Kovancılar / Elazığ</p>
              <p className="font-mono text-[10px] mt-1 text-slate-500">
                {merkezM.lat}° K · {merkezM.lng}° D
              </p>
            </div>
          </Popup>
        </CircleMarker>

        {/* Mahalle marker'ları — her Kovancılar mahallesi için gerçek konumda işaretçi
            Her marker, o mahalledeki vaka sayısını gösterir */}
        {Object.entries(MAHALLE_KOORDINATLARI).map(([mahalleAd, koord]) => {
          // Bu mahalledeki nüfusu bul
          const mahalleBilgi = MAHALLELER.find((m) => m.ad === mahalleAd);
          const mahalleNufus = mahalleBilgi?.nufus ?? 0;
  const mahalleVakaSayisi = mahalleBilgi?.vakaSayisi ?? 0;

          return (
            <CircleMarker
              key={mahalleAd}
              center={[koord.lat, koord.lng]}
              radius={7}
              pathOptions={{
                color: "#1e40af",
                fillColor: "#3b82f6",
                fillOpacity: 0.2,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-sm text-slate-800">
                    🏘️ {mahalleAd} Mahallesi
                  </p>
                  <p className="text-slate-600 mt-1">
                    Kovancılar / Elazığ
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-slate-700">
                      <span className="font-semibold">👥 Nüfus:</span> {mahalleNufus.toLocaleString("tr-TR")} kişi
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">📋 Vaka:</span> {mahalleVakaSayisi} adet
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">📊 Vaka/Nüfus:</span> %{((mahalleVakaSayisi / Math.max(mahalleNufus, 1)) * 100).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-mono text-[10px] mt-2 text-slate-500">
                    {koord.lat.toFixed(4)}° K · {koord.lng.toFixed(4)}° D
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Vaka noktaları — her vaka kendi mahallesinin gerçek koordinatında */}
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
                    {n.lat.toFixed(4)}° K · {n.lng.toFixed(4)}° D
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Köşe UI overlay */}
      <div className="absolute top-2 left-2 z-[1000] flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-blue-500/40 backdrop-blur-sm pointer-events-none">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-mono text-slate-100 font-bold">
          KOVANCILAR / ELAZIĞ
        </span>
      </div>

      <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 backdrop-blur-sm pointer-events-none">
        <Crosshair className="w-3 h-3 text-blue-400" />
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
        <p className="text-[10px] font-mono text-slate-500">
          Kovancılar haritası yükleniyor...
        </p>
      </div>
    </div>
  );
}
