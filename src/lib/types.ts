// Kovancılar Belediyesi · Saha Operasyon Merkezi — Tip Tanımları

export type BirimId =
  | "operasyon"
  | "fen-isleri"
  | "zabita"
  | "altyapi"
  | "idari-isler";

export interface Birim {
  id: BirimId;
  ad: string;
  kisaAd: string;
  aciklama: string;
  ikon: string; // lucide ikon adı
  renk: string; // tailwind text-* sınıfı
}

export interface Personel {
  sicil: string;
  adSoyad: string;
  birimId: BirimId;
  rol: string;
  sifre: string;
}

export interface SessionUser {
  sicil: string;
  adSoyad: string;
  birimId: BirimId;
  rol: string;
}

// --- Operasyonel tipler ---

export type VakaOncelik = "kritik" | "yuksek" | "orta" | "dusuk";
export type VakaDurum =
  | "yeni"
  | "atandi"
  | "devam-ediyor"
  | "cozuldu"
  | "iptal";

export interface Vaka {
  id: string;
  birimId: BirimId;
  baslik: string;
  aciklama: string;
  mahalle: string;
  adres: string;
  oncelik: VakaOncelik;
  durum: VakaDurum;
  oluşturmaZamani: string; // ISO
  atananEkip?: string;
  atananPersonel?: string;
  koordinat?: { lat: number; lng: number };
  kategori: string;
}

export interface Ekip {
  id: string;
  birimId: BirimId;
  ad: string;
  lider: string;
  uyeSayisi: number;
  durum: "musait" | "gorevde" | "mola" | "izinde";
  arac?: string;
  konum: string;
}

export interface Arac {
  id: string;
  plaka: string;
  tur: string;
  birimId: BirimId;
  durum: "musait" | "gorevde" | "bakim";
  km: number;
  surucu?: string;
}

export interface Mahalle {
  id: string;
  ad: string;
  nufus: number;
  vakaSayisi: number;
}

export interface Bildirim {
  id: string;
  baslik: string;
  icerik: string;
  seviye: "bilgi" | "uyari" | "kritik";
  zaman: string;
  okundu: boolean;
}

export interface DenetimKaydi {
  id: string;
  isletme: string;
  adres: string;
  tip: string;
  sonuc: "uygun" | "uyari" | "ceza" | "kapatma";
  zaman: string;
  ekip: string;
  not?: string;
}

export interface SuAruzaKaydi {
  id: string;
  mahalle: string;
  adres: string;
  tur: "kirilma" | "sizi" | "koku" | "tikanma" | "renk";
  durum: VakaDurum;
  oncelik: VakaOncelik;
  acildigiZaman: string;
  atananEkip?: string;
}

export interface Evrak {
  id: string;
  evrakNo: string;
  konu: string;
  gonderen: string;
  alici: string;
  tarih: string;
  durum: "bekliyor" | "isleniyor" | "tamamlandi";
  tip: string;
}

// --- Ruhsat tipleri ---

export type RuhsatDurum = "beklemede" | "inceleniyor" | "onaylandi" | "reddedildi" | "iptal";

export type RuhsatTur =
  | "isyeri-acma"
  | "etkinlik"
  | "yapi-insaat"
  | "pazar-yeri";

export interface Ruhsat {
  id: string;
  basvuruNo: string;
  tur: RuhsatTur;
  baslik: string;
  basvuran: string;
  isletmeAdi: string;
  telefon: string;
  mahalle: string;
  adres: string;
  faaliyetKonusu: string;
  durum: RuhsatDurum;
  basvuruTarihi: string;
  onayTarihi?: string;
  not?: string;
  ucret?: number;
}

// --- Pazar Yeri Tezgah ---

export interface PazarYeriTezgah {
  id: string;
  tezgahNo: string;
  pazarGunu: string;
  esnafAdi: string;
  faaliyet: string;
  ucret: number;
  odendi: boolean;
  durum: "aktif" | "pasif" | "beklemede";
}
