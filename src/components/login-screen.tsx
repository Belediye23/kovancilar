"use client";

import { useState, useMemo } from "react";
import {
  Command,
  HardHat,
  ShieldCheck,
  Layers,
  FileText,
  Eye,
  EyeOff,
  LogIn,
  ShieldAlert,
  Lock,
  MapPin,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BIRIMLER,
  authenticate,
  rememberSicil,
  loadRememberedSicil,
  clearRememberedSicil,
} from "@/lib/auth";
import type { BirimId, SessionUser } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BelediyeLogo } from "@/components/shared/belediye-logo";

const BIRIM_IKONLAR: Record<BirimId, React.ComponentType<{ className?: string }>> = {
  operasyon: Command,
  "fen-isleri": HardHat,
  zabita: ShieldCheck,
  altyapi: Layers,
  "idari-isler": FileText,
};

interface LoginScreenProps {
  onLogin: (user: SessionUser) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedBirim, setSelectedBirim] = useState<BirimId>("operasyon");
  const [sicil, setSicil] = useState("");
  const [sifre, setSifre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hatırlanan sicil bilgisini bir kereye mahsus başlangıç fonksiyonuyla yükle
  // — useEffect içinde setState çağırıp cascading render tetiklemek yerine
  // lazy initial state kullanıyoruz (mount'tan önce sadece bir kere okur).
  const [remember, setRemember] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return !!loadRememberedSicil();
  });

  const activeBirim = useMemo(
    () => BIRIMLER.find((b) => b.id === selectedBirim)!,
    [selectedBirim]
  );

  function selectBirim(id: BirimId) {
    setSelectedBirim(id);
    setError(null);
    // Birim değiştiğinde sicili temizle; birim izolasyonu
    setSicil("");
    setSifre("");
  }

  function handleDemoAccount(birimId: BirimId, sicilNo: string, demoSifre: string) {
    setSelectedBirim(birimId);
    setSicil(sicilNo);
    setSifre(demoSifre);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // kısa feedback için min 350ms
    setTimeout(() => {
      const result = authenticate(selectedBirim, sicil.trim(), sifre);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        toast({
          title: "Giriş başarısız",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // hatırla?
      if (remember) {
        rememberSicil(selectedBirim, sicil.trim());
      } else {
        clearRememberedSicil();
      }

      toast({
        title: `Hoş geldiniz, ${result.user.adSoyad}`,
        description: `${activeBirim.ad} birim paneline yönlendiriliyorsunuz.`,
      });

      onLogin(result.user);
    }, 380);
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-grid-navy">
      {/* Radial mavi ışıma */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      {/* Sol üstte teknik koordinat bilgisi */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-[10px] sm:text-xs font-mono text-slate-700 select-none flex items-center gap-2">
        <MapPin className="w-3 h-3" />
        <span>
          38.4237° K · 27.1428° D — KOVANCILAR / ELAZIĞ
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">BİRİM İZOLE GİRİŞ SİSTEMİ</span>
      </div>

      {/* Sağ üstte sistem durumu rozeti */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          SİSTEM AKTİF · v1.1
        </div>
      </div>

      {/* Ana içerik — ortalanmış kart */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl">
          {/* Logo + başlık bölümü */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <BelediyeLogo size={96} rounded="xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              KOVANCILAR BELEDİYESİ
            </h1>
            <p className="text-blue-300/90 text-sm sm:text-base font-medium mt-1">
              Belediye Saha Operasyon Merkezi
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 font-mono tracking-wide">
              PERSONEL GİRİŞİ · BİRİM SEÇİMLİ
            </p>
          </div>

          {/* Giriş kartı */}
          <div
            className="rounded-2xl border border-white/[0.06] p-5 sm:p-7 backdrop-blur-sm"
            style={{
              background: "rgba(21, 30, 46, 0.85)",
              boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Form başlığı */}
            <div className="mb-5 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Yetkili Personel Girişi
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Biriminizi seçin; Sicil No ve şifreniz yalnızca seçtiğiniz
                birim için geçerlidir.
              </p>
            </div>

            {/* Birim seçim kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-5">
              {BIRIMLER.map((birim) => {
                const Icon = BIRIM_IKONLAR[birim.id];
                const active = selectedBirim === birim.id;
                return (
                  <button
                    key={birim.id}
                    type="button"
                    onClick={() => selectBirim(birim.id)}
                    className={cn(
                      "group relative flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg border text-left transition-all duration-150",
                      "hover:border-blue-500/40 hover:bg-slate-800/50",
                      active
                        ? "border-blue-500 bg-slate-800/70 ring-1 ring-blue-500/30"
                        : "border-slate-700 bg-slate-800/40"
                    )}
                  >
                    {/* Sol mavi çizgi — aktif durumda */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-blue-500" />
                    )}
                    <Icon
                      className={cn(
                        "w-5 h-5 mt-0.5 shrink-0 transition-colors",
                        active ? "text-blue-400" : "text-slate-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs sm:text-sm font-medium leading-tight",
                          active ? "text-white" : "text-slate-200"
                        )}
                      >
                        {birim.ad}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                        {birim.aciklama}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sicil No */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {activeBirim.ad.toUpperCase()} · SİCİL NUMARASI
                </label>
                <Input
                  type="text"
                  value={sicil}
                  onChange={(e) => setSicil(e.target.value)}
                  placeholder="Sicil numaranızı girin"
                  required
                  autoComplete="username"
                  className={cn(
                    "h-11 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-600",
                    "focus:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
                    "rounded-lg"
                  )}
                />
              </div>

              {/* Şifre */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                  {activeBirim.ad.toUpperCase()} · ŞİFRE
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={cn(
                      "h-11 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-600 pr-10",
                      "focus:border-blue-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
                      "rounded-lg"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Beni hatırla + Şifremi unuttum */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                    Sicil numaramı bu cihazda hatırla
                  </span>
                </label>
              </div>

              {/* Hata mesajı */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/5 border border-rose-500/30 text-rose-300 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Giriş butonu */}
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 sm:h-12 text-sm sm:text-base font-semibold",
                  "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
                  "border border-blue-500/40",
                  "shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)]",
                  "text-white rounded-lg transition-all",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Doğrulanıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Birim Paneline Giriş Yap
                  </>
                )}
              </Button>

              {/* Şifremi unuttum */}
              <button
                type="button"
                onClick={() =>
                  toast({
                    title: "Şifre sıfırlama talebi",
                    description:
                      "Demo modda şifre sıfırlama simüle edilir. Operasyon Müdürü ile iletişime geçin.",
                  })
                }
                className="w-full text-center text-xs sm:text-sm text-slate-400 hover:text-slate-200 underline underline-offset-4 decoration-slate-600 hover:decoration-slate-400 transition-colors"
              >
                Şifremi Unuttum / İlk Giriş Şifre Değiştir
              </button>
            </form>

            {/* Demo hesaplar bölümü */}
            <div className="mt-6 pt-5 border-t border-dashed border-slate-700/60">
              <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3 text-center">
                {activeBirim.ad.toUpperCase()} · DEMO HESAPLARI
              </p>

              {/* Aktif birim için demo hesap listesi */}
              <div className="space-y-2">
                {DEMO_HESAPLAR[selectedBirim].map((d) => (
                  <button
                    key={d.sicil}
                    type="button"
                    onClick={() =>
                      handleDemoAccount(selectedBirim, d.sicil, d.demoSifre)
                    }
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-300 text-xs font-semibold shrink-0">
                        {d.adSoyad.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm text-slate-100 font-medium truncate">
                          {d.sicil} · {d.adSoyad}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {d.rol}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>

              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 text-center font-mono">
                Bu birim demo şifresi:{" "}
                <span className="text-slate-300">
                  {DEMO_HESAPLAR[selectedBirim][0].demoSifre}
                </span>
              </p>
            </div>

            {/* Birim izolasyonu notu */}
            <div className="mt-5 flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/[0.04] border border-blue-500/15">
              <Lock className="w-3.5 h-3.5 text-blue-400/70 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-medium">Birim izolasyonu:</span>{" "}
                Her birimin şifresi bağımsızdır. Bir birimin personeli diğer
                birimin paneline kesinlikle erişemez; hesaplar birimler arası
                doğrulanmaz.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-6 text-center">
            <p className="text-[11px] text-slate-500">
              © 2026 Kovancılar Belediyesi · Belediye Saha Operasyon Merkezi
            </p>
            <p className="text-[10px] text-slate-600 mt-1.5 font-mono">
              Yetkisiz erişim denemeleri birim ve sicil bazında kayıt altına
              alınır · v1.1 (demo)
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

// --- Demo hesaplar — birim başına 2 adet ---

const DEMO_HESAPLAR: Record<
  BirimId,
  { sicil: string; adSoyad: string; rol: string; demoSifre: string }[]
> = {
  operasyon: [
    { sicil: "0001", adSoyad: "Belediye Başkanı", rol: "Sistem Yöneticisi (Tam Yetki)", demoSifre: "kovancilar2026" },
    { sicil: "1001", adSoyad: "Mehmet Yılmaz", rol: "Operasyon Müdürü", demoSifre: "demo1234" },
    { sicil: "1002", adSoyad: "Selin Kaya", rol: "Komuta Operatörü", demoSifre: "demo1234" },
  ],
  "fen-isleri": [
    { sicil: "2001", adSoyad: "Ahmet Demir", rol: "Fen Eksperi", demoSifre: "fen12345" },
    { sicil: "2002", adSoyad: "Veli Şahin", rol: "Saha Şefi", demoSifre: "fen12345" },
  ],
  zabita: [
    { sicil: "3001", adSoyad: "Hasan Aslan", rol: "Zabıta Amiri", demoSifre: "zabita123" },
    { sicil: "3002", adSoyad: "Elif Çelik", rol: "Büro Memuru", demoSifre: "zabita123" },
  ],
  altyapi: [
    { sicil: "4001", adSoyad: "Ayşe Koç", rol: "Altyapı Mühendisi", demoSifre: "altyapi1" },
    { sicil: "4002", adSoyad: "Murat Aksoy", rol: "Saha Teknisyeni", demoSifre: "altyapi1" },
  ],
  "idari-isler": [
    { sicil: "5001", adSoyad: "Fatma Erdoğan", rol: "İdari İşler Sorumlusu", demoSifre: "idari123" },
    { sicil: "5002", adSoyad: "Ömer Yıldırım", rol: "Kayıt Memuru", demoSifre: "idari123" },
  ],
};
