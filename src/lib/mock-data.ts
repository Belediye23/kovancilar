import type {
  Vaka,
  Ekip,
  Arac,
  Mahalle,
  Bildirim,
  DenetimKaydi,
  SuAruzaKaydi,
  Evrak,
  VakaOncelik,
  VakaDurum,
  BirimId,
} from "./types";

// --- Kovancılar / Elazığ koordinatı (login ekranında görülen değer) ---
export const KOVANCILAR_KOORDINAT = {
  lat: 38.4237,
  lng: 27.1428,
};

// Kovancılar / Elazığ — her mahallenin gerçek merkez koordinatları
// (Google Maps / OpenStreetMap'ten yaklaşık merkezler)
export const MAHALLE_KOORDINATLARI: Record<
  string,
  { lat: number; lng: number }
> = {
  Merkez: { lat: 38.4237, lng: 27.1428 },      // Kovancılar ilçe merkezi
  Cumhuriyet: { lat: 38.4220, lng: 27.1400 },   // Cumhuriyet Mah.
  Yenidoğan: { lat: 38.4260, lng: 27.1450 },   // Yenidoğan Mah.
  Atatürk: { lat: 38.4180, lng: 27.1490 },     // Atatürk Mah.
  İstasyon: { lat: 38.4200, lng: 27.1370 },    // İstasyon Mah.
  Aşağıçanlı: { lat: 38.4150, lng: 27.1350 },  // Aşağıçanlı Mah.
  Yukarıçanlı: { lat: 38.4320, lng: 27.1480 }, // Yukarıçanlı Mah.
  Recepkaya: { lat: 38.4150, lng: 27.1550 },   // Recepkaya Mah.
};

export const MAHALLELER: Mahalle[] = [
  { id: "m1", ad: "Merkez", nufus: 8420, vakaSayisi: 12 },
  { id: "m2", ad: "Cumhuriyet", nufus: 6310, vakaSayisi: 8 },
  { id: "m3", ad: "Yenidoğan", nufus: 5180, vakaSayisi: 6 },
  { id: "m4", ad: "Atatürk", nufus: 4720, vakaSayisi: 5 },
  { id: "m5", ad: "İstasyon", nufus: 3940, vakaSayisi: 4 },
  { id: "m6", ad: "Aşağıçanlı", nufus: 2860, vakaSayisi: 3 },
  { id: "m7", ad: "Yukarıçanlı", nufus: 2410, vakaSayisi: 2 },
  { id: "m8", ad: "Recepkaya", nufus: 1980, vakaSayisi: 2 },
];

const ahora = (gunOnce: number) => {
  const d = new Date();
  d.setDate(d.getDate() - gunOnce);
  d.setHours(8 + (gunOnce % 10), (gunOnce * 7) % 60, 0, 0);
  return d.toISOString();
};

// alias — historical/once short helper, kept for evrak dated list
const hace = (gunOnce: number) => ahora(gunOnce);

export const VAKALAR: Vaka[] = [
  // --- Fen İşleri (4) ---
  {
    id: "V-2026-0042",
    birimId: "fen-isleri",
    baslik: "Kaldırım taşaları devrik",
    aciklama:
      "Cumhuriyet Mah. İnönü Cad. üzerinde 12 metrelik kaldırım bölümünde taşalar yerinden oynamış; yay trafiği riskli.",
    mahalle: "Cumhuriyet",
    adres: "İnönü Cad. No:42",
    oncelik: "yuksek",
    durum: "atandi",
    olusturmaZamani: ahora(1),
    atananEkip: "FEN-EKIP-1",
    atananPersonel: "Ahmet Demir",
    koordinat: { lat: 38.4228, lng: 27.1398 },
    kategori: "Kaldırım",
  },
  {
    id: "V-2026-0043",
    birimId: "fen-isleri",
    baslik: "Yol çukuru — Atatürk Mah.",
    aciklama:
      "Atatürk Mah. 1428. Sokakta ~60cm çapında, 15cm derinliğinde çukur oluştu; araç geçişinde hasar riski.",
    mahalle: "Atatürk",
    adres: "1428. Sokak No:7",
    oncelik: "kritik",
    durum: "devam-ediyor",
    olusturmaZamani: ahora(2),
    atananEkip: "FEN-EKIP-2",
    atananPersonel: "Veli Şahin",
    koordinat: { lat: 38.4178, lng: 27.1492 },
    kategori: "Yol",
  },
  {
    id: "V-2026-0044",
    birimId: "fen-isleri",
    baslik: "Parke yüzey yenileme — Yenidoğan",
    aciklama:
      "Yenidoğan Mah. Park önü 180m² parke yüzey ezilmiş; yenileme planlaması gerekiyor.",
    mahalle: "Yenidoğan",
    adres: "Park İçi Yolu No:1",
    oncelik: "orta",
    durum: "yeni",
    olusturmaZamani: ahora(0),
    koordinat: { lat: 38.4263, lng: 27.1448 },
    kategori: "Parke",
  },
  {
    id: "V-2026-0045",
    birimId: "fen-isleri",
    baslik: "Kaldırım rampa talebi",
    aciklama:
      "Merkez Mah. Sağlık Ocağı önü kaldırıma engelli rampası talebi. Vatandaş şikayeti.",
    mahalle: "Merkez",
    adres: "Cumhuriyet Cad. Sağlık Ocağı",
    oncelik: "dusuk",
    durum: "cozuldu",
    olusturmaZamani: ahora(5),
    atananEkip: "FEN-EKIP-1",
    koordinat: { lat: 38.4242, lng: 27.1432 },
    kategori: "Kaldırım",
  },

  // --- Zabıta (4) ---
  {
    id: "V-2026-0031",
    birimId: "zabita",
    baslik: "İşgal yolu kapatma",
    aciklama:
      "İstasyon Meydanında seyyar satıcılar yaya ve araç geçişini engelleyecek şekilde işgal.",
    mahalle: "İstasyon",
    adres: "Meydan Camii çevresi",
    oncelik: "yuksek",
    durum: "atandi",
    olusturmaZamani: ahora(0),
    atananEkip: "ZAB-EKIP-1",
    atananPersonel: "Hasan Aslan",
    koordinat: { lat: 38.4203, lng: 27.1375 },
    kategori: "İşgal",
  },
  {
    id: "V-2026-0032",
    birimId: "zabita",
    baslik: "Gürültü şikayeti",
    aciklama:
      "Cumhuriyet Mah. düğün salonu gece 23:30 sonrası müzik yayını nedeniyle çevre sakinleri şikayetçi.",
    mahalle: "Cumhuriyet",
    adres: "Sümer Sok. No:11",
    oncelik: "orta",
    durum: "yeni",
    olusturmaZamani: ahora(1),
    koordinat: { lat: 38.4218, lng: 27.1402 },
    kategori: "Gürültü",
  },
  {
    id: "V-2026-0033",
    birimId: "zabita",
    baslik: "Ruhsatsız tezgah",
    aciklama:
      "Atatürk Mah. Pazar yerinde 2 tezgah sahibinin ruhsat ibaresi yok; denetim gerekli.",
    mahalle: "Atatürk",
    adres: "Haftalık Pazar Alanı",
    oncelik: "dusuk",
    durum: "cozuldu",
    olusturmaZamani: ahora(3),
    atananEkip: "ZAB-EKIP-2",
    koordinat: { lat: 38.4183, lng: 27.1488 },
    kategori: "Ruhsat",
  },
  {
    id: "V-2026-0034",
    birimId: "zabita",
    baslik: "Çevre kirliliği — moloz döküm",
    aciklama:
      "Aşağıçanlı Mah. boş arsaya moloz döküldü; sahada tespit edildi.",
    mahalle: "Aşağıçanlı",
    adres: "Boş arsa, 23. Sokak",
    oncelik: "orta",
    durum: "devam-ediyor",
    koordinat: { lat: 38.4152, lng: 27.1352 },
    olusturmaZamani: ahora(2),
    atananEkip: "ZAB-EKIP-1",
    kategori: "Çevre",
  },

  // --- Altyapı (4) ---
  {
    id: "V-2026-0021",
    birimId: "altyapi",
    baslik: "Su kırılması — ana hat",
    aciklama:
      "İstasyon Mah. Su ana hattında kırık; yaklaşık 40 hane susuz kaldı, su baskını riski.",
    mahalle: "İstasyon",
    adres: "Demirçelik Cad. No:18",
    oncelik: "kritik",
    durum: "devam-ediyor",
    olusturmaZamani: ahora(0),
    atananEkip: "SU-EKIP-1",
    atananPersonel: "Ayşe Koç",
    koordinat: { lat: 38.4197, lng: 27.1392 },
    kategori: "Su Kırılma",
  },
  {
    id: "V-2026-0022",
    birimId: "altyapi",
    baslik: "Kanalizasyon tıkanması",
    aciklama:
      "Yenidoğan Mah. 1453. Sokakta kanalizasyon hattı tıkalı; geri tepme nedeniyle koku ve sıvı birikintisi.",
    mahalle: "Yenidoğan",
    adres: "1453. Sokak No:4",
    oncelik: "yuksek",
    durum: "atandi",
    olusturmaZamani: ahora(1),
    atananEkip: "SU-EKIP-2",
    koordinat: { lat: 38.4258, lng: 27.1452 },
    kategori: "Kanalizasyon",
  },
  {
    id: "V-2026-0023",
    birimId: "altyapi",
    baslik: "Su sızıntısı — vana",
    aciklama:
      "Cumhuriyet Mah. köşe vana odasından sızıntı; basınç kaybı yok ama su israfı yüksek.",
    mahalle: "Cumhuriyet",
    adres: "Cumhuriyet Cad. Vana Odası 4",
    oncelik: "orta",
    durum: "yeni",
    olusturmaZamani: ahora(0),
    koordinat: { lat: 38.4215, lng: 27.1395 },
    kategori: "Su Sızıntı",
  },
  {
    id: "V-2026-0024",
    birimId: "altyapi",
    baslik: "Su koku şikayeti",
    aciklama:
      "Recepkaya Mah. musluk suyundan koku geliyor; numune alınıp analiz edilmesi gerekiyor.",
    mahalle: "Recepkaya",
    adres: "Çamlık Sok. No:9",
    oncelik: "orta",
    durum: "cozuldu",
    olusturmaZamani: ahora(4),
    atananEkip: "SU-EKIP-2",
    koordinat: { lat: 38.4155, lng: 27.1548 },
    kategori: "Su Koku",
  },

  // --- İdari İşler (3) ---
  {
    id: "V-2026-0011",
    birimId: "idari-isler",
    baslik: "Resmi yazışma gecikmesi",
    aciklama:
      "Valilik yazısının cevaplanma süresi 3 gün kaldı; hatırlatma gerekli.",
    mahalle: "Merkez",
    adres: "Belediye Binası 2.Kat",
    oncelik: "yuksek",
    durum: "devam-ediyor",
    olusturmaZamani: ahora(2),
    koordinat: { lat: 38.4240, lng: 27.1430 },
    kategori: "Yazışma",
  },
  {
    id: "V-2026-0012",
    birimId: "idari-isler",
    baslik: "Personel özlük hak talebi",
    aciklama:
      "Fen İşleri birim personeli mazeret izni sonrası ek ücret talebi; İdari İşler değerlendiriyor.",
    mahalle: "Merkez",
    adres: "Belediye Binası 1.Kat",
    oncelik: "dusuk",
    durum: "yeni",
    olusturmaZamani: ahora(0),
    koordinat: { lat: 38.4235, lng: 27.1425 },
    kategori: "Özlük",
  },
  {
    id: "V-2026-0013",
    birimId: "idari-isler",
    baslik: "Arşiv düzenleme",
    aciklama:
      "2024 yılı evraklarının dijital arşive aktarımı yarım kaldı; İdari İşler sorumlu.",
    mahalle: "Merkez",
    adres: "Belediye Binası Zemin",
    oncelik: "orta",
    durum: "atandi",
    olusturmaZamani: ahora(3),
    koordinat: { lat: 38.4239, lng: 27.1431 },
    kategori: "Arşiv",
  },
];

// Operasyon Merkezi tüm vakaları görür; yukarıdakilerin toplamı zaten.
// Yine de operasyona özel birkaç ilave kritik durum ekleyelim:
export const OPERASYON_OZEL_VAKALAR: Vaka[] = [
  {
    id: "V-2026-0099",
    birimId: "operasyon",
    baslik: "Acil toplantı — Kurumlar arası koordinasyon",
    aciklama:
      "Valilik, AFAD ve Belediye arasında koordinasyon toplantısı talep edildi. Operasyon Merkezi ev sahipliği yapıyor.",
    mahalle: "Merkez",
    adres: "Belediye Toplantı Salonu",
    oncelik: "kritik",
    durum: "atandi",
    olusturmaZamani: ahora(0),
    atananEkip: "OP-KOMUTA",
    atananPersonel: "Mehmet Yılmaz",
    koordinat: { lat: 38.4241, lng: 27.1429 },
    kategori: "Koordinasyon",
  },
  {
    id: "V-2026-0098",
    birimId: "operasyon",
    baslik: "Kırsal mahalleler — ulaşılabilirlik",
    aciklama:
      "Recepkaya ve Yukarıçanlı güzergahında kar yağışı sonrası ulaşılabilirlik kontrolü gerekli.",
    mahalle: "Yukarıçanlı",
    adres: "Köy yolu 4.km",
    oncelik: "yuksek",
    durum: "yeni",
    olusturmaZamani: ahora(0),
    koordinat: { lat: 38.4318, lng: 27.1482 },
    kategori: "Kırsal Ulaşım",
  },
];

export const EKIPLER: Ekip[] = [
  // Fen İşleri
  {
    id: "FEN-EKIP-1",
    birimId: "fen-isleri",
    ad: "Fen Saha Ekip 1",
    lider: "Ahmet Demir",
    uyeSayisi: 4,
    durum: "gorevde",
    arac: "34 ABC 123",
    konum: "Cumhuriyet Mah. İnönü Cad.",
  },
  {
    id: "FEN-EKIP-2",
    birimId: "fen-isleri",
    ad: "Fen Saha Ekip 2",
    lider: "Veli Şahin",
    uyeSayisi: 3,
    durum: "gorevde",
    arac: "34 DEF 456",
    konum: "Atatürk Mah. 1428. Sokak",
  },
  {
    id: "FEN-EKIP-3",
    birimId: "fen-isleri",
    ad: "Fen Saha Ekip 3",
    lider: "Cuma Türk",
    uyeSayisi: 4,
    durum: "musait",
    arac: "34 GHI 789",
    konum: "Belediye Sahası",
  },
  // Zabıta
  {
    id: "ZAB-EKIP-1",
    birimId: "zabita",
    ad: "Zabıta Saha 1",
    lider: "Hasan Aslan",
    uyeSayisi: 3,
    durum: "gorevde",
    arac: "23 ZAB 01",
    konum: "İstasyon Meydanı",
  },
  {
    id: "ZAB-EKIP-2",
    birimId: "zabita",
    ad: "Zabıta Saha 2",
    lider: "Elif Çelik",
    uyeSayisi: 2,
    durum: "musait",
    arac: "23 ZAB 02",
    konum: "Belediye Binası",
  },
  {
    id: "ZAB-EKIP-3",
    birimId: "zabita",
    ad: "Zabıta Saha 3 (Mola)",
    lider: "Yusuf Kara",
    uyeSayisi: 2,
    durum: "mola",
    konum: "Atatürk Parkı",
  },
  // Altyapı
  {
    id: "SU-EKIP-1",
    birimId: "altyapi",
    ad: "Su Saha 1 (Acil)",
    lider: "Ayşe Koç",
    uyeSayisi: 4,
    durum: "gorevde",
    arac: "23 SU 01",
    konum: "İstasyon Mah. Demirçelik Cad.",
  },
  {
    id: "SU-EKIP-2",
    birimId: "altyapi",
    ad: "Su Saha 2",
    lider: "Murat Aksoy",
    uyeSayisi: 3,
    durum: "gorevde",
    arac: "23 SU 02",
    konum: "Yenidoğan Mah. 1453. Sokak",
  },
  {
    id: "SU-EKIP-3",
    birimId: "altyapi",
    ad: "Su Saha 3 (Vardiya)",
    lider: "Semih Yıldız",
    uyeSayisi: 3,
    durum: "musait",
    konum: "Su Şefliği Deposu",
  },
  // İdari İşler
  {
    id: "IDARI-EKIP-1",
    birimId: "idari-isler",
    ad: "İdari Kayıt 1",
    lider: "Fatma Erdoğan",
    uyeSayisi: 2,
    durum: "gorevde",
    konum: "İdari İşler Müd. 2.Kat",
  },
  {
    id: "IDARI-EKIP-2",
    birimId: "idari-isler",
    ad: "Arşiv Ekibi",
    lider: "Ömer Yıldırım",
    uyeSayisi: 2,
    durum: "gorevde",
    konum: "Belediye Binası Zemin",
  },
  // Operasyon
  {
    id: "OP-KOMUTA",
    birimId: "operasyon",
    ad: "Komuta Merkezi",
    lider: "Mehmet Yılmaz",
    uyeSayisi: 5,
    durum: "gorevde",
    konum: "Belediye Saha Operasyon Merkezi",
  },
];

export const ARAÇLAR: Arac[] = [
  {
    id: "ARAC-001",
    plaka: "34 ABC 123",
    tur: "Kamyonet 4x4",
    birimId: "fen-isleri",
    durum: "gorevde",
    km: 84210,
    surucu: "FEN-EKIP-1",
  },
  {
    id: "ARAC-002",
    plaka: "34 DEF 456",
    tur: "Kamyon (Yük)",
    birimId: "fen-isleri",
    durum: "gorevde",
    km: 142880,
    surucu: "FEN-EKIP-2",
  },
  {
    id: "ARAC-003",
    plaka: "34 GHI 789",
    tur: "Mini İş Makinesi",
    birimId: "fen-isleri",
    durum: "musait",
    km: 31240,
  },
  {
    id: "ARAC-004",
    plaka: "23 ZAB 01",
    tur: "Ekip Aracı",
    birimId: "zabita",
    durum: "gorevde",
    km: 62810,
    surucu: "ZAB-EKIP-1",
  },
  {
    id: "ARAC-005",
    plaka: "23 ZAB 02",
    tur: "Ekip Aracı",
    birimId: "zabita",
    durum: "musait",
    km: 54920,
  },
  {
    id: "ARAC-006",
    plaka: "23 SU 01",
    tur: "Su Saha Arazi",
    birimId: "altyapi",
    durum: "gorevde",
    km: 78430,
    surucu: "SU-EKIP-1",
  },
  {
    id: "ARAC-007",
    plaka: "23 SU 02",
    tur: "Kanal Aracı",
    birimId: "altyapi",
    durum: "gorevde",
    km: 95110,
    surucu: "SU-EKIP-2",
  },
];

export const BILDIRIMLER: Bildirim[] = [
  {
    id: "B-1",
    baslik: "Kritik vaka atandı",
    icerik: "V-2026-0021 — Su kırılması, İstasyon Mah. SU-EKIP-1 ekibe atandı.",
    seviye: "kritik",
    zaman: ahora(0),
    okundu: false,
  },
  {
    id: "B-2",
    baslik: "Ekip mola durumuna geçti",
    icerik: "ZAB-EKIP-3 (Yusuf Kara) 15 dk mola verdi.",
    seviye: "bilgi",
    zaman: ahora(0),
    okundu: false,
  },
  {
    id: "B-3",
    baslik: "Araç bakım bildirimi",
    icerik: "34 GHI 789 (Mini İş Makinesi) periyodik bakım zamanı geldi.",
    seviye: "uyari",
    zaman: ahora(1),
    okundu: false,
  },
  {
    id: "B-4",
    baslik: "Yeni vatandaş şikayeti",
    icerik: "Cumhuriyet Mah. sakinlerinden gürültü şikayeti (V-2026-0032).",
    seviye: "uyari",
    zaman: ahora(1),
    okundu: true,
  },
  {
    id: "B-5",
    baslik: "Vaka çözüldü",
    icerik: "V-2026-0024 (Su koku şikayeti — Recepkaya) kapatıldı.",
    seviye: "bilgi",
    zaman: ahora(2),
    okundu: true,
  },
];

export const DENETIM_KAYITLARI: DenetimKaydi[] = [
  {
    id: "D-2026-001",
    isletme: "Market Yıldız",
    adres: "Cumhuriyet Mah. 1428. Sokak",
    tip: "Hijyen",
    sonuc: "uyari",
    zaman: ahora(1),
    ekip: "ZAB-EKIP-1",
    not: "Soğuk zincir sıcaklık kaydı eksik.",
  },
  {
    id: "D-2026-002",
    isletme: "Lokanta Anadolu",
    adres: "İstasyon Meydanı No:4",
    tip: "İşgal",
    sonuc: "ceza",
    zaman: ahora(2),
    ekip: "ZAB-EKIP-1",
    not: "İşgal tekrarı — 850₺ ceza.",
  },
  {
    id: "D-2026-003",
    isletme: "Pastane Bahar",
    adres: "Atatürk Mah. 1421. Sokak",
    tip: "Hijyen",
    sonuc: "uygun",
    zaman: ahora(3),
    ekip: "ZAB-EKIP-2",
  },
  {
    id: "D-2026-004",
    isletme: "Seyyar Tezgah 14",
    adres: "Haftalık Pazar Alanı",
    tip: "Ruhsat",
    sonuc: "ceza",
    zaman: ahora(3),
    ekip: "ZAB-EKIP-2",
    not: "Ruhsat ibaresi yok — tezgaha el konuldu.",
  },
  {
    id: "D-2026-005",
    isletme: "Kıraathanesi Çınar",
    adres: "Merkez Mah. Cumhuriyet Cad.",
    tip: "Gürültü",
    sonuc: "uyari",
    zaman: ahora(4),
    ekip: "ZAB-EKIP-1",
  },
];

export const SU_ARIZA: SuAruzaKaydi[] = [
  {
    id: "S-2026-001",
    mahalle: "İstasyon",
    adres: "Demirçelik Cad. No:18",
    tur: "kirilma",
    durum: "devam-ediyor",
    oncelik: "kritik",
    acildigiZaman: ahora(0),
    atananEkip: "SU-EKIP-1",
  },
  {
    id: "S-2026-002",
    mahalle: "Yenidoğan",
    adres: "1453. Sokak No:4",
    tur: "tikanma",
    durum: "atandi",
    oncelik: "yuksek",
    acildigiZaman: ahora(1),
    atananEkip: "SU-EKIP-2",
  },
  {
    id: "S-2026-003",
    mahalle: "Cumhuriyet",
    adres: "Vana Odası 4",
    tur: "sizi",
    durum: "yeni",
    oncelik: "orta",
    acildigiZaman: ahora(0),
  },
  {
    id: "S-2026-004",
    mahalle: "Recepkaya",
    adres: "Çamlık Sok. No:9",
    tur: "koku",
    durum: "cozuldu",
    oncelik: "orta",
    acildigiZaman: ahora(4),
    atananEkip: "SU-EKIP-2",
  },
  {
    id: "S-2026-005",
    mahalle: "Merkez",
    adres: "Cumhuriyet Cad. No:55",
    tur: "renk",
    durum: "yeni",
    oncelik: "dusuk",
    acildigiZaman: ahora(1),
  },
];

export const EVRAKLAR: Evrak[] = [
  {
    id: "E-2026-101",
    evrakNo: "2026/1024",
    konu: "Valilik yazısı — Kurumlar arası koordinasyon",
    gonderen: "Elazığ Valiliği",
    alici: "Kovancılar Belediye Başkanlığı",
    tarih: ahora(2),
    durum: "isleniyor",
    tip: "Resmi Gelen",
  },
  {
    id: "E-2026-102",
    evrakNo: "2026/1025",
    konu: "Personel mazeret izin talebi",
    gonderen: "Fen İşleri Müdürlüğü",
    alici: "İdari İşler",
    tarih: ahora(0),
    durum: "bekliyor",
    tip: "İç Yazışma",
  },
  {
    id: "E-2026-103",
    evrakNo: "2026/1026",
    konu: "Arşiv dijital aktarım talebi",
    gonderen: "İdari İşler",
    alici: "Bilgi İşlem",
    tarih: ahora(3),
    durum: "isleniyor",
    tip: "İç Yazışma",
  },
  {
    id: "E-2026-104",
    evrakNo: "2026/1027",
    konu: "Mahalle sakinleri çevre şikayeti",
    gonderen: "Aşağıçanlı Muhtarlığı",
    alici: "Zabıta Müdürlüğü",
    tarih: hace(1),
    durum: "tamamlandi",
    tip: "Resmi Gelen",
  },
  {
    id: "E-2026-105",
    evrakNo: "2026/1028",
    konu: "Fen İşleri aylık rapor — Eylül 2026",
    gonderen: "Fen İşleri Müdürlüğü",
    alici: "Belediye Başkanlığı",
    tarih: hace(0),
    durum: "bekliyor",
    tip: "İç Yazışma",
  },
];

// --- Yardımcı fonksiyonlar ---

export function getVakalarByBirim(birimId: BirimId): Vaka[] {
  if (birimId === "operasyon") {
    return [...VAKALAR, ...OPERASYON_OZEL_VAKALAR];
  }
  return VAKALAR.filter((v) => v.birimId === birimId);
}

export function getEkilerByBirim(birimId: BirimId): Ekip[] {
  if (birimId === "operasyon") {
    return EKIPLER;
  }
  return EKIPLER.filter((e) => e.birimId === birimId);
}

export function getAraclarByBirim(birimId: BirimId): Arac[] {
  if (birimId === "operasyon") {
    return ARAÇLAR;
  }
  return ARAÇLAR.filter((a) => a.birimId === birimId);
}

export const ONCELIK_RENK: Record<VakaOncelik, string> = {
  kritik: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  yuksek: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  orta: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  dusuk: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

export const DURUM_RENK: Record<VakaDurum, string> = {
  yeni: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  atandi: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "devam-ediyor": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  cozuldu: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  iptal: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

export const ONCELIK_ETIKET: Record<VakaOncelik, string> = {
  kritik: "KRİTİK",
  yuksek: "YÜKSEK",
  orta: "ORTA",
  dusuk: "DÜŞÜK",
};

export const DURUM_ETIKET: Record<VakaDurum, string> = {
  yeni: "YENİ",
  atandi: "ATANDI",
  "devam-ediyor": "DEVAM EDİYOR",
  cozuldu: "ÇÖZÜLDÜ",
  iptal: "İPTAL",
};

export function formatTarih(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatTarihKisa(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
