import type { Birim, BirimId, Personel, SessionUser } from "./types";

// --- Birim kataloğu ---

export const BIRIMLER: Birim[] = [
  {
    id: "operasyon",
    ad: "Operasyon Merkezi",
    kisaAd: "Operasyon",
    aciklama: "Merkez komuta · tam yetki",
    ikon: "Command",
    renk: "text-blue-400",
  },
  {
    id: "fen-isleri",
    ad: "Fen İşleri",
    kisaAd: "Fen İşleri",
    aciklama: "Yol · kaldırım · parke",
    ikon: "HardHat",
    renk: "text-amber-400",
  },
  {
    id: "zabita",
    ad: "Zabıta Müdürlüğü",
    kisaAd: "Zabıta",
    aciklama: "Büro & saha denetim",
    ikon: "ShieldCheck",
    renk: "text-rose-400",
  },
  {
    id: "altyapi",
    ad: "Altyapı Koordinasyon",
    kisaAd: "Altyapı",
    aciklama: "Su · kanalizasyon",
    ikon: "Layers",
    renk: "text-cyan-400",
  },
  {
    id: "idari-isler",
    ad: "İdari İşler",
    kisaAd: "İdari İşler",
    aciklama: "Raporlama & kayıt",
    ikon: "FileText",
    renk: "text-emerald-400",
  },
];

export function getBirim(id: BirimId): Birim {
  return BIRIMLER.find((b) => b.id === id) ?? BIRIMLER[0];
}

// --- Yönetici hesapları — her birimde tek sicil 0001 ---

// Varsayılan şifre — kullanıcı sonradan her birim için değiştirebilir.
// Değiştirilen şifreler localStorage'da saklanır.
export const VARSAYILAN_SIFRE = "123456789";

export const PERSONEL: Personel[] = [
  // --- Operasyon Merkezi — Belediye Başkanı (tüm birimlere tam yetki) ---
  {
    sicil: "0001",
    adSoyad: "Belediye Başkanı",
    birimId: "operasyon",
    rol: "Belediye Başkanı / Sistem Yöneticisi",
    sifre: VARSAYILAN_SIFRE,
  },
  // --- Fen İşleri Müdürü ---
  {
    sicil: "0001",
    adSoyad: "Fen İşleri Müdürü",
    birimId: "fen-isleri",
    rol: "Fen İşleri Yöneticisi",
    sifre: VARSAYILAN_SIFRE,
  },
  // --- Zabıta Müdürü ---
  {
    sicil: "0001",
    adSoyad: "Zabıta Müdürü",
    birimId: "zabita",
    rol: "Zabıta Yöneticisi",
    sifre: VARSAYILAN_SIFRE,
  },
  // --- Altyapı Koordinasyon Müdürü ---
  {
    sicil: "0001",
    adSoyad: "Altyapı Müdürü",
    birimId: "altyapi",
    rol: "Altyapı Yöneticisi",
    sifre: VARSAYILAN_SIFRE,
  },
  // --- İdari İşler Müdürü ---
  {
    sicil: "0001",
    adSoyad: "İdari İşler Müdürü",
    birimId: "idari-isler",
    rol: "İdari İşler Yöneticisi",
    sifre: VARSAYILAN_SIFRE,
  },
];

// --- Custom şifre yönetimi (localStorage) ---
// Kullanıcı şifre değiştirdiğinde buraya kaydedilir.
// Key: "birimId:sicil", Value: yeni şifre

const SIFRE_KEY = "kovancilar_bsm_sifreler";

function loadCustomSifreler(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SIFRE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function saveCustomSifreler(map: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIFRE_KEY, JSON.stringify(map));
}

// Bir personelin aktif şifresini döndürür — varsa custom, yoksa varsayılan
export function getAktifSifre(birimId: BirimId, sicil: string): string {
  const map = loadCustomSifreler();
  return map[`${birimId}:${sicil}`] ?? VARSAYILAN_SIFRE;
}

// Şifre değiştir — yeni şifreyi localStorage'a kaydeder
export function changeSifre(
  birimId: BirimId,
  sicil: string,
  yeniSifre: string
): { ok: boolean; error?: string } {
  if (yeniSifre.length < 4) {
    return { ok: false, error: "Yeni şifre en az 4 karakter olmalı." };
  }
  const map = loadCustomSifreler();
  map[`${birimId}:${sicil}`] = yeniSifre;
  saveCustomSifreler(map);
  return { ok: true };
}

// Şifreyi varsayılana sıfırla
export function resetSifre(
  birimId: BirimId,
  sicil: string
): void {
  const map = loadCustomSifreler();
  delete map[`${birimId}:${sicil}`];
  saveCustomSifreler(map);
}

// --- Kimlik doğrulama (localStorage tabanlı) ---

const SESSION_KEY = "kovancilar_bsm_session";

// Türkçe karakter normalizasyonu — şifre karşılaştırmasında
// 'ı' ↔ 'i', 'İ' ↔ 'I', 'ğ' ↔ 'g', 'ş' ↔ 's', 'ü' ↔ 'u',
// 'ö' ↔ 'o', 'ç' ↔ 'c' eşleşmesi yapar. Böylece kullanıcı klavye
// düzeninden bağımsız olarak şifreyi yazabilir.
function normalizeTr(str: string): string {
  if (!str) return "";
  return str
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .trim();
}

export function authenticate(
  birimId: BirimId,
  sicil: string,
  sifre: string
): { ok: true; user: SessionUser } | { ok: false; error: string } {
  // Sicil alanını normalize et — boşlukları vs. kırp
  const sicilTrimmed = (sicil ?? "").trim();
  const sifreTrimmed = (sifre ?? "").trim();

  // Sicili hem normal hem de sıfır-dolgu (0001 ↔ 1) ile ara
  const user = PERSONEL.find(
    (p) =>
      (p.sicil === sicilTrimmed ||
        // 0001 → 1 normalize ederek de dene
        parseInt(p.sicil, 10).toString() ===
          parseInt(sicilTrimmed, 10).toString()) &&
      p.birimId === birimId
  );

  if (!user) {
    return {
      ok: false,
      error:
        "Sicil numarası seçilen birimde kayıtlı değil. Birim-izole yapı nedeniyle her sicil yalnızca kendi biriminde geçerlidir. Önce biriminizi seçtiğinizden emin olun (örn: Operasyon Merkezi).",
    };
  }

  // Aktif şifre — custom varsa onu kullan, yoksa varsayılan
  const aktifSifre = getAktifSifre(user.birimId, user.sicil);

  // Şifre karşılaştırma — Türkçe karakter normalizasyonu ile
  // "123456789" == "123456789", "kovancilar2026" == "kovancılar2026" == "KOVANCILAR2026"
  if (normalizeTr(aktifSifre) !== normalizeTr(sifreTrimmed)) {
    return {
      ok: false,
      error:
        "Şifre hatalı. Varsayılan şifre: 123456789. Şifreyi değiştirdiyseniz yeni şifrenizi girin. Türkçe karakter/büyük-küçük harf farkı önemli değildir.",
    };
  }

  return {
    ok: true,
    user: {
      sicil: user.sicil,
      adSoyad: user.adSoyad,
      birimId: user.birimId,
      rol: user.rol,
    },
  };
}

export function saveSession(user: SessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

// --- Hatırlanan sicil ---

const SICIL_KEY = "kovancilar_bsm_hatirla_sicil";
const SICIL_BIRIM_KEY = "kovancilar_bsm_hatirla_birim";

export function rememberSicil(birimId: BirimId, sicil: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SICIL_KEY, sicil);
  localStorage.setItem(SICIL_BIRIM_KEY, birimId);
}

export function loadRememberedSicil(): { birimId: BirimId; sicil: string } | null {
  if (typeof window === "undefined") return null;
  const sicil = localStorage.getItem(SICIL_KEY);
  const birimId = localStorage.getItem(SICIL_BIRIM_KEY) as BirimId | null;
  if (!sicil || !birimId) return null;
  return { birimId, sicil };
}

export function clearRememberedSicil(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SICIL_KEY);
  localStorage.removeItem(SICIL_BIRIM_KEY);
}
