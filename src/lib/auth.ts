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

// --- Demo personel — birim bazlı şifre izolasyonu ---

export const PERSONEL: Personel[] = [
  // --- Sistem yöneticisi / Belediye Başkanı (tüm birimlere tam yetki) ---
  {
    sicil: "0001",
    adSoyad: "Belediye Başkanı",
    birimId: "operasyon",
    rol: "Belediye Başkanı / Sistem Yöneticisi",
    sifre: "kovancilar2026",
  },
  {
    sicil: "1001",
    adSoyad: "Mehmet Yılmaz",
    birimId: "operasyon",
    rol: "Operasyon Müdürü",
    sifre: "demo1234",
  },
  {
    sicil: "1002",
    adSoyad: "Selin Kaya",
    birimId: "operasyon",
    rol: "Komuta Operatörü",
    sifre: "demo1234",
  },
  {
    sicil: "2001",
    adSoyad: "Ahmet Demir",
    birimId: "fen-isleri",
    rol: "Fen Eksperi",
    sifre: "fen12345",
  },
  {
    sicil: "2002",
    adSoyad: "Veli Şahin",
    birimId: "fen-isleri",
    rol: "Saha Şefi",
    sifre: "fen12345",
  },
  {
    sicil: "3001",
    adSoyad: "Hasan Aslan",
    birimId: "zabita",
    rol: "Zabıta Amiri",
    sifre: "zabita123",
  },
  {
    sicil: "3002",
    adSoyad: "Elif Çelik",
    birimId: "zabita",
    rol: "Büro Memuru",
    sifre: "zabita123",
  },
  {
    sicil: "4001",
    adSoyad: "Ayşe Koç",
    birimId: "altyapi",
    rol: "Altyapı Mühendisi",
    sifre: "altyapi1",
  },
  {
    sicil: "4002",
    adSoyad: "Murat Aksoy",
    birimId: "altyapi",
    rol: "Saha Teknisyeni",
    sifre: "altyapi1",
  },
  {
    sicil: "5001",
    adSoyad: "Fatma Erdoğan",
    birimId: "idari-isler",
    rol: "İdari İşler Sorumlusu",
    sifre: "idari123",
  },
  {
    sicil: "5002",
    adSoyad: "Ömer Yıldırım",
    birimId: "idari-isler",
    rol: "Kayıt Memuru",
    sifre: "idari123",
  },
];

// --- Kimlik doğrulama (localStorage tabanlı, demo amaçlı) ---

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

  // Şifre karşılaştırma — Türkçe karakter normalizasyonu ile
  // "kovancilar2026" == "kovancılar2026" == "KOVANCILAR2026"
  if (normalizeTr(user.sifre) !== normalizeTr(sifreTrimmed)) {
    return {
      ok: false,
      error:
        "Şifre hatalı. Türkçe karakter veya büyük/küçük harf farkı olmamalı; yine de tekrar deneyin. İpucu: kovancilar2026 (ı veya i, fark etmez).",
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
