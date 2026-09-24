"use client";

import { cn } from "@/lib/utils";
import { MapPin, Navigation, Crosshair } from "lucide-react";
import { KOVANCILAR_KOORDINAT } from "@/lib/mock-data";

interface MiniHaritaProps {
  noktalar: { lat: number; lng: number; etiket?: string; oncelik?: string }[];
  height?: number | string;
  className?: string;
}

// SVG tabanlı basit harita — Kovancılar merkezli görselleştirme
// Üzerinde noktalar konumlandırır, gerçek bir map tile kullanmaz (demo amaçlı)
export function MiniHarita({ noktalar, height = 280, className }: MiniHaritaProps) {
  const merkezM = KOVANCILAR_KOORDINAT;

  // Kovancılar civarı sınırlar
  const bounds = {
    minLat: merkezM.lat - 0.012,
    maxLat: merkezM.lat + 0.012,
    minLng: merkezM.lng - 0.018,
    maxLng: merkezM.lng + 0.018,
  };

  const width = 600;
  const h = typeof height === "number" ? height : 280;

  function project(lat: number, lng: number) {
    const x =
      ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y =
      ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * h;
    return { x, y };
  }

  const center = project(merkezM.lat, merkezM.lng);

  // Renk eşleme (oncelik -> renk)
  const renk: Record<string, string> = {
    kritik: "#f43f5e",
    yuksek: "#f59e0b",
    orta: "#3b82f6",
    dusuk: "#64748b",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900/40",
        className
      )}
      style={{ height: typeof height === "number" ? height : height }}
    >
      <svg
        viewBox={`0 0 ${width} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        {/* Grid */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(59, 130, 246, 0.08)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="merkez-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.35)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        <rect width={width} height={h} fill="url(#grid)" />

        {/* Merkez ışıma */}
        <circle cx={center.x} cy={center.y} r={70} fill="url(#merkez-glow)" />

        {/* Ana yol çizgileri — soyut */}
        <line
          x1={0}
          y1={h * 0.5}
          x2={width}
          y2={h * 0.5}
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={1.5}
          strokeDasharray="2 4"
        />
        <line
          x1={width * 0.5}
          y1={0}
          x2={width * 0.5}
          y2={h}
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={1.5}
          strokeDasharray="2 4"
        />
        <line
          x1={0}
          y1={0}
          x2={width}
          y2={h}
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth={1}
          strokeDasharray="1 6"
        />

        {/* Merkez nokta — belediye binası */}
        <g>
          <circle
            cx={center.x}
            cy={center.y}
            r={5}
            fill="#3b82f6"
            opacity={0.3}
          />
          <circle
            cx={center.x}
            cy={center.y}
            r={3}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={0.5}
          />
          <text
            x={center.x + 8}
            y={center.y + 4}
            fill="rgba(226, 232, 240, 0.7)"
            fontSize={9}
            fontFamily="monospace"
          >
            MERKEZ
          </text>
        </g>

        {/* Vaka noktaları */}
        {noktalar.map((n, i) => {
          const p = project(n.lat, n.lng);
          const color = renk[n.oncelik ?? "orta"] ?? renk.orta;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={8} fill={color} opacity={0.18} />
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={color}
                stroke="white"
                strokeWidth={0.6}
              />
              {n.etiket && (
                <text
                  x={p.x + 8}
                  y={p.y - 6}
                  fill="rgba(226, 232, 240, 0.85)"
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {n.etiket}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Köşe UI overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/70 border border-slate-700/60 backdrop-blur-sm">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-mono text-slate-300">
          KOVANCILAR / ELAZIĞ
        </span>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/70 border border-slate-700/60 backdrop-blur-sm">
        <Crosshair className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] font-mono text-slate-400">
          {merkezM.lat}°K · {merkezM.lng}°D
        </span>
      </div>

      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900/70 border border-slate-700/60 backdrop-blur-sm">
        <Navigation className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] font-mono text-slate-400">
          {noktalar.length} NOKTA · CANLI
        </span>
      </div>

      {/* Lejant */}
      <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-2 px-2 py-1 rounded-md bg-slate-900/70 border border-slate-700/60 backdrop-blur-sm">
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
    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
