module.exports = [
"[project]/src/lib/auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BIRIMLER",
    ()=>BIRIMLER,
    "PERSONEL",
    ()=>PERSONEL,
    "VARSAYILAN_SIFRE",
    ()=>VARSAYILAN_SIFRE,
    "authenticate",
    ()=>authenticate,
    "changeSifre",
    ()=>changeSifre,
    "clearRememberedSicil",
    ()=>clearRememberedSicil,
    "clearSession",
    ()=>clearSession,
    "getAktifSifre",
    ()=>getAktifSifre,
    "getBirim",
    ()=>getBirim,
    "loadRememberedSicil",
    ()=>loadRememberedSicil,
    "loadSession",
    ()=>loadSession,
    "rememberSicil",
    ()=>rememberSicil,
    "resetSifre",
    ()=>resetSifre,
    "saveSession",
    ()=>saveSession
]);
const BIRIMLER = [
    {
        id: "operasyon",
        ad: "Operasyon Merkezi",
        kisaAd: "Operasyon",
        aciklama: "Merkez komuta · tam yetki",
        ikon: "Command",
        renk: "text-blue-400"
    },
    {
        id: "fen-isleri",
        ad: "Fen İşleri",
        kisaAd: "Fen İşleri",
        aciklama: "Yol · kaldırım · parke",
        ikon: "HardHat",
        renk: "text-amber-400"
    },
    {
        id: "zabita",
        ad: "Zabıta Müdürlüğü",
        kisaAd: "Zabıta",
        aciklama: "Büro & saha denetim",
        ikon: "ShieldCheck",
        renk: "text-rose-400"
    },
    {
        id: "altyapi",
        ad: "Altyapı Koordinasyon",
        kisaAd: "Altyapı",
        aciklama: "Su · kanalizasyon",
        ikon: "Layers",
        renk: "text-cyan-400"
    },
    {
        id: "idari-isler",
        ad: "İdari İşler",
        kisaAd: "İdari İşler",
        aciklama: "Raporlama & kayıt",
        ikon: "FileText",
        renk: "text-emerald-400"
    }
];
function getBirim(id) {
    return BIRIMLER.find((b)=>b.id === id) ?? BIRIMLER[0];
}
const VARSAYILAN_SIFRE = "123456789";
const PERSONEL = [
    // --- Operasyon Merkezi — Belediye Başkanı (tüm birimlere tam yetki) ---
    {
        sicil: "0001",
        adSoyad: "Belediye Başkanı",
        birimId: "operasyon",
        rol: "Belediye Başkanı / Sistem Yöneticisi",
        sifre: VARSAYILAN_SIFRE
    },
    // --- Fen İşleri Müdürü ---
    {
        sicil: "0001",
        adSoyad: "Fen İşleri Müdürü",
        birimId: "fen-isleri",
        rol: "Fen İşleri Yöneticisi",
        sifre: VARSAYILAN_SIFRE
    },
    // --- Zabıta Müdürü ---
    {
        sicil: "0001",
        adSoyad: "Zabıta Müdürü",
        birimId: "zabita",
        rol: "Zabıta Yöneticisi",
        sifre: VARSAYILAN_SIFRE
    },
    // --- Altyapı Koordinasyon Müdürü ---
    {
        sicil: "0001",
        adSoyad: "Altyapı Müdürü",
        birimId: "altyapi",
        rol: "Altyapı Yöneticisi",
        sifre: VARSAYILAN_SIFRE
    },
    // --- İdari İşler Müdürü ---
    {
        sicil: "0001",
        adSoyad: "İdari İşler Müdürü",
        birimId: "idari-isler",
        rol: "İdari İşler Yöneticisi",
        sifre: VARSAYILAN_SIFRE
    }
];
// --- Custom şifre yönetimi (localStorage) ---
// Kullanıcı şifre değiştirdiğinde buraya kaydedilir.
// Key: "birimId:sicil", Value: yeni şifre
const SIFRE_KEY = "kovancilar_bsm_sifreler";
function loadCustomSifreler() {
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
}
function saveCustomSifreler(map) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getAktifSifre(birimId, sicil) {
    const map = loadCustomSifreler();
    return map[`${birimId}:${sicil}`] ?? VARSAYILAN_SIFRE;
}
function changeSifre(birimId, sicil, yeniSifre) {
    if (yeniSifre.length < 4) {
        return {
            ok: false,
            error: "Yeni şifre en az 4 karakter olmalı."
        };
    }
    const map = loadCustomSifreler();
    map[`${birimId}:${sicil}`] = yeniSifre;
    saveCustomSifreler(map);
    return {
        ok: true
    };
}
function resetSifre(birimId, sicil) {
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
function normalizeTr(str) {
    if (!str) return "";
    return str.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/İ/g, "i").replace(/ğ/g, "g").replace(/Ğ/g, "g").replace(/ş/g, "s").replace(/Ş/g, "s").replace(/ü/g, "u").replace(/Ü/g, "u").replace(/ö/g, "o").replace(/Ö/g, "o").replace(/ç/g, "c").replace(/Ç/g, "c").trim();
}
function authenticate(birimId, sicil, sifre) {
    // Sicil alanını normalize et — boşlukları vs. kırp
    const sicilTrimmed = (sicil ?? "").trim();
    const sifreTrimmed = (sifre ?? "").trim();
    // Sicili hem normal hem de sıfır-dolgu (0001 ↔ 1) ile ara
    const user = PERSONEL.find((p)=>(p.sicil === sicilTrimmed || // 0001 → 1 normalize ederek de dene
        parseInt(p.sicil, 10).toString() === parseInt(sicilTrimmed, 10).toString()) && p.birimId === birimId);
    if (!user) {
        return {
            ok: false,
            error: "Sicil numarası seçilen birimde kayıtlı değil. Birim-izole yapı nedeniyle her sicil yalnızca kendi biriminde geçerlidir. Önce biriminizi seçtiğinizden emin olun (örn: Operasyon Merkezi)."
        };
    }
    // Aktif şifre — custom varsa onu kullan, yoksa varsayılan
    const aktifSifre = getAktifSifre(user.birimId, user.sicil);
    // Şifre karşılaştırma — Türkçe karakter normalizasyonu ile
    // "123456789" == "123456789", "kovancilar2026" == "kovancılar2026" == "KOVANCILAR2026"
    if (normalizeTr(aktifSifre) !== normalizeTr(sifreTrimmed)) {
        return {
            ok: false,
            error: "Şifre hatalı. Varsayılan şifre: 123456789. Şifreyi değiştirdiyseniz yeni şifrenizi girin. Türkçe karakter/büyük-küçük harf farkı önemli değildir."
        };
    }
    return {
        ok: true,
        user: {
            sicil: user.sicil,
            adSoyad: user.adSoyad,
            birimId: user.birimId,
            rol: user.rol
        }
    };
}
function saveSession(user) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function loadSession() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
function clearSession() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
// --- Hatırlanan sicil ---
const SICIL_KEY = "kovancilar_bsm_hatirla_sicil";
const SICIL_BIRIM_KEY = "kovancilar_bsm_hatirla_birim";
function rememberSicil(birimId, sicil) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function loadRememberedSicil() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const sicil = undefined;
    const birimId = undefined;
}
function clearRememberedSicil() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
}),
"[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ARAÇLAR",
    ()=>ARAÇLAR,
    "BILDIRIMLER",
    ()=>BILDIRIMLER,
    "DENETIM_KAYITLARI",
    ()=>DENETIM_KAYITLARI,
    "DURUM_ETIKET",
    ()=>DURUM_ETIKET,
    "DURUM_RENK",
    ()=>DURUM_RENK,
    "EKIPLER",
    ()=>EKIPLER,
    "EVRAKLAR",
    ()=>EVRAKLAR,
    "KOVANCILAR_KOORDINAT",
    ()=>KOVANCILAR_KOORDINAT,
    "MAHALLELER",
    ()=>MAHALLELER,
    "ONCELIK_ETIKET",
    ()=>ONCELIK_ETIKET,
    "ONCELIK_RENK",
    ()=>ONCELIK_RENK,
    "OPERASYON_OZEL_VAKALAR",
    ()=>OPERASYON_OZEL_VAKALAR,
    "SU_ARIZA",
    ()=>SU_ARIZA,
    "VAKALAR",
    ()=>VAKALAR,
    "formatTarih",
    ()=>formatTarih,
    "formatTarihKisa",
    ()=>formatTarihKisa,
    "getAraclarByBirim",
    ()=>getAraclarByBirim,
    "getEkilerByBirim",
    ()=>getEkilerByBirim,
    "getVakalarByBirim",
    ()=>getVakalarByBirim
]);
const KOVANCILAR_KOORDINAT = {
    lat: 38.4237,
    lng: 27.1428
};
const MAHALLELER = [
    {
        id: "m1",
        ad: "Merkez",
        nufus: 8420,
        vakaSayisi: 12
    },
    {
        id: "m2",
        ad: "Cumhuriyet",
        nufus: 6310,
        vakaSayisi: 8
    },
    {
        id: "m3",
        ad: "Yenidoğan",
        nufus: 5180,
        vakaSayisi: 6
    },
    {
        id: "m4",
        ad: "Atatürk",
        nufus: 4720,
        vakaSayisi: 5
    },
    {
        id: "m5",
        ad: "İstasyon",
        nufus: 3940,
        vakaSayisi: 4
    },
    {
        id: "m6",
        ad: "Aşağıçanlı",
        nufus: 2860,
        vakaSayisi: 3
    },
    {
        id: "m7",
        ad: "Yukarıçanlı",
        nufus: 2410,
        vakaSayisi: 2
    },
    {
        id: "m8",
        ad: "Recepkaya",
        nufus: 1980,
        vakaSayisi: 2
    }
];
const ahora = (gunOnce)=>{
    const d = new Date();
    d.setDate(d.getDate() - gunOnce);
    d.setHours(8 + gunOnce % 10, gunOnce * 7 % 60, 0, 0);
    return d.toISOString();
};
// alias — historical/once short helper, kept for evrak dated list
const hace = (gunOnce)=>ahora(gunOnce);
const VAKALAR = [
    // --- Fen İşleri (4) ---
    {
        id: "V-2026-0042",
        birimId: "fen-isleri",
        baslik: "Kaldırım taşaları devrik",
        aciklama: "Cumhuriyet Mah. İnönü Cad. üzerinde 12 metrelik kaldırım bölümünde taşalar yerinden oynamış; yay trafiği riskli.",
        mahalle: "Cumhuriyet",
        adres: "İnönü Cad. No:42",
        oncelik: "yuksek",
        durum: "atandi",
        olusturmaZamani: ahora(1),
        atananEkip: "FEN-EKIP-1",
        atananPersonel: "Ahmet Demir",
        koordinat: {
            lat: 38.4225,
            lng: 27.1408
        },
        kategori: "Kaldırım"
    },
    {
        id: "V-2026-0043",
        birimId: "fen-isleri",
        baslik: "Yol çukuru — Atatürk Mah.",
        aciklama: "Atatürk Mah. 1428. Sokakta ~60cm çapında, 15cm derinliğinde çukur oluştu; araç geçişinde hasar riski.",
        mahalle: "Atatürk",
        adres: "1428. Sokak No:7",
        oncelik: "kritik",
        durum: "devam-ediyor",
        olusturmaZamani: ahora(2),
        atananEkip: "FEN-EKIP-2",
        atananPersonel: "Veli Şahin",
        koordinat: {
            lat: 38.4182,
            lng: 27.1495
        },
        kategori: "Yol"
    },
    {
        id: "V-2026-0044",
        birimId: "fen-isleri",
        baslik: "Parke yüzey yenileme — Yenidoğan",
        aciklama: "Yenidoğan Mah. Park önü 180m² parke yüzey ezilmiş; yenileme planlaması gerekiyor.",
        mahalle: "Yenidoğan",
        adres: "Park İçi Yolu No:1",
        oncelik: "orta",
        durum: "yeni",
        olusturmaZamani: ahora(0),
        koordinat: {
            lat: 38.4261,
            lng: 27.1442
        },
        kategori: "Parke"
    },
    {
        id: "V-2026-0045",
        birimId: "fen-isleri",
        baslik: "Kaldırım rampa talebi",
        aciklama: "Merkez Mah. Sağlık Ocağı önü kaldırıma engelli rampası talebi. Vatandaş şikayeti.",
        mahalle: "Merkez",
        adres: "Cumhuriyet Cad. Sağlık Ocağı",
        oncelik: "dusuk",
        durum: "cozuldu",
        olusturmaZamani: ahora(5),
        atananEkip: "FEN-EKIP-1",
        kategori: "Kaldırım"
    },
    // --- Zabıta (4) ---
    {
        id: "V-2026-0031",
        birimId: "zabita",
        baslik: "İşgal yolu kapatma",
        aciklama: "İstasyon Meydanında seyyar satıcılar yaya ve araç geçişini engelleyecek şekilde işgal.",
        mahalle: "İstasyon",
        adres: "Meydan Camii çevresi",
        oncelik: "yuksek",
        durum: "atandi",
        olusturmaZamani: ahora(0),
        atananEkip: "ZAB-EKIP-1",
        atananPersonel: "Hasan Aslan",
        koordinat: {
            lat: 38.4201,
            lng: 27.1378
        },
        kategori: "İşgal"
    },
    {
        id: "V-2026-0032",
        birimId: "zabita",
        baslik: "Gürültü şikayeti",
        aciklama: "Cumhuriyet Mah. düğün salonu gece 23:30 sonrası müzik yayını nedeniyle çevre sakinleri şikayetçi.",
        mahalle: "Cumhuriyet",
        adres: "Sümer Sok. No:11",
        oncelik: "orta",
        durum: "yeni",
        olusturmaZamani: ahora(1),
        kategori: "Gürültü"
    },
    {
        id: "V-2026-0033",
        birimId: "zabita",
        baslik: "Ruhsatsız tezgah",
        aciklama: "Atatürk Mah. Pazar yerinde 2 tezgah sahibinin ruhsat ibaresi yok; denetim gerekli.",
        mahalle: "Atatürk",
        adres: "Haftalık Pazar Alanı",
        oncelik: "dusuk",
        durum: "cozuldu",
        olusturmaZamani: ahora(3),
        atananEkip: "ZAB-EKIP-2",
        kategori: "Ruhsat"
    },
    {
        id: "V-2026-0034",
        birimId: "zabita",
        baslik: "Çevre kirliliği — moloz döküm",
        aciklama: "Aşağıçanlı Mah. boş arsaya moloz döküldü; sahada tespit edildi.",
        mahalle: "Aşağıçanlı",
        adres: "Boş arsa, 23. Sokak",
        oncelik: "orta",
        durum: "devam-ediyor",
        olusturmaZamani: ahora(2),
        atananEkip: "ZAB-EKIP-1",
        kategori: "Çevre"
    },
    // --- Altyapı (4) ---
    {
        id: "V-2026-0021",
        birimId: "altyapi",
        baslik: "Su kırılması — ana hat",
        aciklama: "İstasyon Mah. Su ana hattında kırık; yaklaşık 40 hane susuz kaldı, su baskını riski.",
        mahalle: "İstasyon",
        adres: "Demirçelik Cad. No:18",
        oncelik: "kritik",
        durum: "devam-ediyor",
        olusturmaZamani: ahora(0),
        atananEkip: "SU-EKIP-1",
        atananPersonel: "Ayşe Koç",
        koordinat: {
            lat: 38.4195,
            lng: 27.1389
        },
        kategori: "Su Kırılma"
    },
    {
        id: "V-2026-0022",
        birimId: "altyapi",
        baslik: "Kanalizasyon tıkanması",
        aciklama: "Yenidoğan Mah. 1453. Sokakta kanalizasyon hattı tıkalı; geri tepme nedeniyle koku ve sıvı birikintisi.",
        mahalle: "Yenidoğan",
        adres: "1453. Sokak No:4",
        oncelik: "yuksek",
        durum: "atandi",
        olusturmaZamani: ahora(1),
        atananEkip: "SU-EKIP-2",
        kategori: "Kanalizasyon"
    },
    {
        id: "V-2026-0023",
        birimId: "altyapi",
        baslik: "Su sızıntısı — vana",
        aciklama: "Cumhuriyet Mah. köşe vana odasından sızıntı; basınç kaybı yok ama su israfı yüksek.",
        mahalle: "Cumhuriyet",
        adres: "Cumhuriyet Cad. Vana Odası 4",
        oncelik: "orta",
        durum: "yeni",
        olusturmaZamani: ahora(0),
        kategori: "Su Sızıntı"
    },
    {
        id: "V-2026-0024",
        birimId: "altyapi",
        baslik: "Su koku şikayeti",
        aciklama: "Recepkaya Mah. musluk suyundan koku geliyor; numune alınıp analiz edilmesi gerekiyor.",
        mahalle: "Recepkaya",
        adres: "Çamlık Sok. No:9",
        oncelik: "orta",
        durum: "cozuldu",
        olusturmaZamani: ahora(4),
        atananEkip: "SU-EKIP-2",
        kategori: "Su Koku"
    },
    // --- İdari İşler (3) ---
    {
        id: "V-2026-0011",
        birimId: "idari-isler",
        baslik: "Resmi yazışma gecikmesi",
        aciklama: "Valilik yazısının cevaplanma süresi 3 gün kaldı; hatırlatma gerekli.",
        mahalle: "Merkez",
        adres: "Belediye Binası 2.Kat",
        oncelik: "yuksek",
        durum: "devam-ediyor",
        olusturmaZamani: ahora(2),
        kategori: "Yazışma"
    },
    {
        id: "V-2026-0012",
        birimId: "idari-isler",
        baslik: "Personel özlük hak talebi",
        aciklama: "Fen İşleri birim personeli mazeret izni sonrası ek ücret talebi; İdari İşler değerlendiriyor.",
        mahalle: "Merkez",
        adres: "Belediye Binası 1.Kat",
        oncelik: "dusuk",
        durum: "yeni",
        olusturmaZamani: ahora(0),
        kategori: "Özlük"
    },
    {
        id: "V-2026-0013",
        birimId: "idari-isler",
        baslik: "Arşiv düzenleme",
        aciklama: "2024 yılı evraklarının dijital arşive aktarımı yarım kaldı; İdari İşler sorumlu.",
        mahalle: "Merkez",
        adres: "Belediye Binası Zemin",
        oncelik: "orta",
        durum: "atandi",
        olusturmaZamani: ahora(3),
        kategori: "Arşiv"
    }
];
const OPERASYON_OZEL_VAKALAR = [
    {
        id: "V-2026-0099",
        birimId: "operasyon",
        baslik: "Acil toplantı — Kurumlar arası koordinasyon",
        aciklama: "Valilik, AFAD ve Belediye arasında koordinasyon toplantısı talep edildi. Operasyon Merkezi ev sahipliği yapıyor.",
        mahalle: "Merkez",
        adres: "Belediye Toplantı Salonu",
        oncelik: "kritik",
        durum: "atandi",
        olusturmaZamani: ahora(0),
        atananEkip: "OP-KOMUTA",
        atananPersonel: "Mehmet Yılmaz",
        kategori: "Koordinasyon"
    },
    {
        id: "V-2026-0098",
        birimId: "operasyon",
        baslik: "Kırsal mahalleler — ulaşılabilirlik",
        aciklama: "Recepkaya ve Yukarıçanlı güzergahında kar yağışı sonrası ulaşılabilirlik kontrolü gerekli.",
        mahalle: "Yukarıçanlı",
        adres: "Köy yolu 4.km",
        oncelik: "yuksek",
        durum: "yeni",
        olusturmaZamani: ahora(0),
        kategori: "Kırsal Ulaşım"
    }
];
const EKIPLER = [
    // Fen İşleri
    {
        id: "FEN-EKIP-1",
        birimId: "fen-isleri",
        ad: "Fen Saha Ekip 1",
        lider: "Ahmet Demir",
        uyeSayisi: 4,
        durum: "gorevde",
        arac: "34 ABC 123",
        konum: "Cumhuriyet Mah. İnönü Cad."
    },
    {
        id: "FEN-EKIP-2",
        birimId: "fen-isleri",
        ad: "Fen Saha Ekip 2",
        lider: "Veli Şahin",
        uyeSayisi: 3,
        durum: "gorevde",
        arac: "34 DEF 456",
        konum: "Atatürk Mah. 1428. Sokak"
    },
    {
        id: "FEN-EKIP-3",
        birimId: "fen-isleri",
        ad: "Fen Saha Ekip 3",
        lider: "Cuma Türk",
        uyeSayisi: 4,
        durum: "musait",
        arac: "34 GHI 789",
        konum: "Belediye Sahası"
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
        konum: "İstasyon Meydanı"
    },
    {
        id: "ZAB-EKIP-2",
        birimId: "zabita",
        ad: "Zabıta Saha 2",
        lider: "Elif Çelik",
        uyeSayisi: 2,
        durum: "musait",
        arac: "23 ZAB 02",
        konum: "Belediye Binası"
    },
    {
        id: "ZAB-EKIP-3",
        birimId: "zabita",
        ad: "Zabıta Saha 3 (Mola)",
        lider: "Yusuf Kara",
        uyeSayisi: 2,
        durum: "mola",
        konum: "Atatürk Parkı"
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
        konum: "İstasyon Mah. Demirçelik Cad."
    },
    {
        id: "SU-EKIP-2",
        birimId: "altyapi",
        ad: "Su Saha 2",
        lider: "Murat Aksoy",
        uyeSayisi: 3,
        durum: "gorevde",
        arac: "23 SU 02",
        konum: "Yenidoğan Mah. 1453. Sokak"
    },
    {
        id: "SU-EKIP-3",
        birimId: "altyapi",
        ad: "Su Saha 3 (Vardiya)",
        lider: "Semih Yıldız",
        uyeSayisi: 3,
        durum: "musait",
        konum: "Su Şefliği Deposu"
    },
    // İdari İşler
    {
        id: "IDARI-EKIP-1",
        birimId: "idari-isler",
        ad: "İdari Kayıt 1",
        lider: "Fatma Erdoğan",
        uyeSayisi: 2,
        durum: "gorevde",
        konum: "İdari İşler Müd. 2.Kat"
    },
    {
        id: "IDARI-EKIP-2",
        birimId: "idari-isler",
        ad: "Arşiv Ekibi",
        lider: "Ömer Yıldırım",
        uyeSayisi: 2,
        durum: "gorevde",
        konum: "Belediye Binası Zemin"
    },
    // Operasyon
    {
        id: "OP-KOMUTA",
        birimId: "operasyon",
        ad: "Komuta Merkezi",
        lider: "Mehmet Yılmaz",
        uyeSayisi: 5,
        durum: "gorevde",
        konum: "Belediye Saha Operasyon Merkezi"
    }
];
const ARAÇLAR = [
    {
        id: "ARAC-001",
        plaka: "34 ABC 123",
        tur: "Kamyonet 4x4",
        birimId: "fen-isleri",
        durum: "gorevde",
        km: 84210,
        surucu: "FEN-EKIP-1"
    },
    {
        id: "ARAC-002",
        plaka: "34 DEF 456",
        tur: "Kamyon (Yük)",
        birimId: "fen-isleri",
        durum: "gorevde",
        km: 142880,
        surucu: "FEN-EKIP-2"
    },
    {
        id: "ARAC-003",
        plaka: "34 GHI 789",
        tur: "Mini İş Makinesi",
        birimId: "fen-isleri",
        durum: "musait",
        km: 31240
    },
    {
        id: "ARAC-004",
        plaka: "23 ZAB 01",
        tur: "Ekip Aracı",
        birimId: "zabita",
        durum: "gorevde",
        km: 62810,
        surucu: "ZAB-EKIP-1"
    },
    {
        id: "ARAC-005",
        plaka: "23 ZAB 02",
        tur: "Ekip Aracı",
        birimId: "zabita",
        durum: "musait",
        km: 54920
    },
    {
        id: "ARAC-006",
        plaka: "23 SU 01",
        tur: "Su Saha Arazi",
        birimId: "altyapi",
        durum: "gorevde",
        km: 78430,
        surucu: "SU-EKIP-1"
    },
    {
        id: "ARAC-007",
        plaka: "23 SU 02",
        tur: "Kanal Aracı",
        birimId: "altyapi",
        durum: "gorevde",
        km: 95110,
        surucu: "SU-EKIP-2"
    }
];
const BILDIRIMLER = [
    {
        id: "B-1",
        baslik: "Kritik vaka atandı",
        icerik: "V-2026-0021 — Su kırılması, İstasyon Mah. SU-EKIP-1 ekibe atandı.",
        seviye: "kritik",
        zaman: ahora(0),
        okundu: false
    },
    {
        id: "B-2",
        baslik: "Ekip mola durumuna geçti",
        icerik: "ZAB-EKIP-3 (Yusuf Kara) 15 dk mola verdi.",
        seviye: "bilgi",
        zaman: ahora(0),
        okundu: false
    },
    {
        id: "B-3",
        baslik: "Araç bakım bildirimi",
        icerik: "34 GHI 789 (Mini İş Makinesi) periyodik bakım zamanı geldi.",
        seviye: "uyari",
        zaman: ahora(1),
        okundu: false
    },
    {
        id: "B-4",
        baslik: "Yeni vatandaş şikayeti",
        icerik: "Cumhuriyet Mah. sakinlerinden gürültü şikayeti (V-2026-0032).",
        seviye: "uyari",
        zaman: ahora(1),
        okundu: true
    },
    {
        id: "B-5",
        baslik: "Vaka çözüldü",
        icerik: "V-2026-0024 (Su koku şikayeti — Recepkaya) kapatıldı.",
        seviye: "bilgi",
        zaman: ahora(2),
        okundu: true
    }
];
const DENETIM_KAYITLARI = [
    {
        id: "D-2026-001",
        isletme: "Market Yıldız",
        adres: "Cumhuriyet Mah. 1428. Sokak",
        tip: "Hijyen",
        sonuc: "uyari",
        zaman: ahora(1),
        ekip: "ZAB-EKIP-1",
        not: "Soğuk zincir sıcaklık kaydı eksik."
    },
    {
        id: "D-2026-002",
        isletme: "Lokanta Anadolu",
        adres: "İstasyon Meydanı No:4",
        tip: "İşgal",
        sonuc: "ceza",
        zaman: ahora(2),
        ekip: "ZAB-EKIP-1",
        not: "İşgal tekrarı — 850₺ ceza."
    },
    {
        id: "D-2026-003",
        isletme: "Pastane Bahar",
        adres: "Atatürk Mah. 1421. Sokak",
        tip: "Hijyen",
        sonuc: "uygun",
        zaman: ahora(3),
        ekip: "ZAB-EKIP-2"
    },
    {
        id: "D-2026-004",
        isletme: "Seyyar Tezgah 14",
        adres: "Haftalık Pazar Alanı",
        tip: "Ruhsat",
        sonuc: "ceza",
        zaman: ahora(3),
        ekip: "ZAB-EKIP-2",
        not: "Ruhsat ibaresi yok — tezgaha el konuldu."
    },
    {
        id: "D-2026-005",
        isletme: "Kıraathanesi Çınar",
        adres: "Merkez Mah. Cumhuriyet Cad.",
        tip: "Gürültü",
        sonuc: "uyari",
        zaman: ahora(4),
        ekip: "ZAB-EKIP-1"
    }
];
const SU_ARIZA = [
    {
        id: "S-2026-001",
        mahalle: "İstasyon",
        adres: "Demirçelik Cad. No:18",
        tur: "kirilma",
        durum: "devam-ediyor",
        oncelik: "kritik",
        acildigiZaman: ahora(0),
        atananEkip: "SU-EKIP-1"
    },
    {
        id: "S-2026-002",
        mahalle: "Yenidoğan",
        adres: "1453. Sokak No:4",
        tur: "tikanma",
        durum: "atandi",
        oncelik: "yuksek",
        acildigiZaman: ahora(1),
        atananEkip: "SU-EKIP-2"
    },
    {
        id: "S-2026-003",
        mahalle: "Cumhuriyet",
        adres: "Vana Odası 4",
        tur: "sizi",
        durum: "yeni",
        oncelik: "orta",
        acildigiZaman: ahora(0)
    },
    {
        id: "S-2026-004",
        mahalle: "Recepkaya",
        adres: "Çamlık Sok. No:9",
        tur: "koku",
        durum: "cozuldu",
        oncelik: "orta",
        acildigiZaman: ahora(4),
        atananEkip: "SU-EKIP-2"
    },
    {
        id: "S-2026-005",
        mahalle: "Merkez",
        adres: "Cumhuriyet Cad. No:55",
        tur: "renk",
        durum: "yeni",
        oncelik: "dusuk",
        acildigiZaman: ahora(1)
    }
];
const EVRAKLAR = [
    {
        id: "E-2026-101",
        evrakNo: "2026/1024",
        konu: "Valilik yazısı — Kurumlar arası koordinasyon",
        gonderen: "Elazığ Valiliği",
        alici: "Kovancılar Belediye Başkanlığı",
        tarih: ahora(2),
        durum: "isleniyor",
        tip: "Resmi Gelen"
    },
    {
        id: "E-2026-102",
        evrakNo: "2026/1025",
        konu: "Personel mazeret izin talebi",
        gonderen: "Fen İşleri Müdürlüğü",
        alici: "İdari İşler",
        tarih: ahora(0),
        durum: "bekliyor",
        tip: "İç Yazışma"
    },
    {
        id: "E-2026-103",
        evrakNo: "2026/1026",
        konu: "Arşiv dijital aktarım talebi",
        gonderen: "İdari İşler",
        alici: "Bilgi İşlem",
        tarih: ahora(3),
        durum: "isleniyor",
        tip: "İç Yazışma"
    },
    {
        id: "E-2026-104",
        evrakNo: "2026/1027",
        konu: "Mahalle sakinleri çevre şikayeti",
        gonderen: "Aşağıçanlı Muhtarlığı",
        alici: "Zabıta Müdürlüğü",
        tarih: hace(1),
        durum: "tamamlandi",
        tip: "Resmi Gelen"
    },
    {
        id: "E-2026-105",
        evrakNo: "2026/1028",
        konu: "Fen İşleri aylık rapor — Eylül 2026",
        gonderen: "Fen İşleri Müdürlüğü",
        alici: "Belediye Başkanlığı",
        tarih: hace(0),
        durum: "bekliyor",
        tip: "İç Yazışma"
    }
];
function getVakalarByBirim(birimId) {
    if (birimId === "operasyon") {
        return [
            ...VAKALAR,
            ...OPERASYON_OZEL_VAKALAR
        ];
    }
    return VAKALAR.filter((v)=>v.birimId === birimId);
}
function getEkilerByBirim(birimId) {
    if (birimId === "operasyon") {
        return EKIPLER;
    }
    return EKIPLER.filter((e)=>e.birimId === birimId);
}
function getAraclarByBirim(birimId) {
    if (birimId === "operasyon") {
        return ARAÇLAR;
    }
    return ARAÇLAR.filter((a)=>a.birimId === birimId);
}
const ONCELIK_RENK = {
    kritik: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    yuksek: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    orta: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    dusuk: "text-slate-400 bg-slate-500/10 border-slate-500/30"
};
const DURUM_RENK = {
    yeni: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    atandi: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    "devam-ediyor": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    cozuldu: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    iptal: "text-slate-400 bg-slate-500/10 border-slate-500/30"
};
const ONCELIK_ETIKET = {
    kritik: "KRİTİK",
    yuksek: "YÜKSEK",
    orta: "ORTA",
    dusuk: "DÜŞÜK"
};
const DURUM_ETIKET = {
    yeni: "YENİ",
    atandi: "ATANDI",
    "devam-ediyor": "DEVAM EDİYOR",
    cozuldu: "ÇÖZÜLDÜ",
    iptal: "İPTAL"
};
function formatTarih(iso) {
    try {
        return new Date(iso).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch  {
        return iso;
    }
}
function formatTarihKisa(iso) {
    try {
        return new Date(iso).toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch  {
        return iso;
    }
}
}),
"[project]/src/lib/store.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateBildirimId",
    ()=>generateBildirimId,
    "generateVakaId",
    ()=>generateVakaId,
    "useOperasyonStore",
    ()=>useOperasyonStore
]);
// Kovancılar Belediyesi · Saha Operasyon Merkezi — Merkezi durum yönetimi
// Zustand + persist (localStorage) ile vaka, bildirim, ekip ve araç
// durumunu kalıcı hale getiriyor. Socket.io olayları da buraya yansır.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)");
;
;
;
const allVakalar = [
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VAKALAR"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OPERASYON_OZEL_VAKALAR"]
];
const initialState = {
    vakalar: allVakalar,
    ekipler: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EKIPLER"],
    bildirimler: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BILDIRIMLER"],
    denetimler: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DENETIM_KAYITLARI"],
    suAriza: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SU_ARIZA"],
    evraklar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EVRAKLAR"],
    mahalleler: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MAHALLELER"],
    araclar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ARAÇLAR"]
};
const useOperasyonStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        ...initialState,
        // Socket.io broadcast fonksiyonu — use-notifications hook tarafından set edilir
        broadcastFn: null,
        setBroadcastFn: (fn)=>set({
                broadcastFn: fn
            }),
        // --- Vaka mutasyonları ---
        addVaka: (vaka)=>{
            set((s)=>({
                    vakalar: [
                        vaka,
                        ...s.vakalar
                    ]
                }));
            // Otomatik bildirim
            const bildirim = {
                id: `B-${Date.now()}`,
                baslik: "Yeni vaka oluşturuldu",
                icerik: `${vaka.id} — ${vaka.baslik} (${vaka.mahalle})`,
                seviye: vaka.oncelik === "kritik" ? "kritik" : "uyari",
                zaman: new Date().toISOString(),
                okundu: false
            };
            get().addBildirim(bildirim);
            // Socket.io'ya broadcast
            const bf = get().broadcastFn;
            if (bf) {
                bf({
                    type: "vaka:create",
                    payload: {
                        vakaId: vaka.id,
                        birimId: vaka.birimId,
                        baslik: bildirim.baslik,
                        icerik: bildirim.icerik,
                        seviye: bildirim.seviye,
                        zaman: bildirim.zaman
                    }
                });
            }
        },
        updateVaka: (id, patch)=>set((s)=>({
                    vakalar: s.vakalar.map((v)=>v.id === id ? {
                            ...v,
                            ...patch
                        } : v)
                })),
        assignEkipToVaka: (id, ekipId, personel)=>{
            const ekip = get().ekipler.find((e)=>e.id === ekipId);
            set((s)=>({
                    vakalar: s.vakalar.map((v)=>v.id === id ? {
                            ...v,
                            atananEkip: ekipId,
                            atananPersonel: personel ?? ekip?.lider,
                            durum: v.durum === "yeni" ? "atandi" : v.durum
                        } : v),
                    ekipler: s.ekipler.map((e)=>e.id === ekipId ? {
                            ...e,
                            durum: "gorevde"
                        } : e)
                }));
            const vaka = get().vakalar.find((v)=>v.id === id);
            const bildirim = {
                id: `B-${Date.now()}`,
                baslik: "Ekip atandı",
                icerik: `${id} → ${ekip?.ad ?? ekipId} (${ekip?.lider ?? ""})`,
                seviye: "bilgi",
                zaman: new Date().toISOString(),
                okundu: false
            };
            get().addBildirim(bildirim);
            const bf = get().broadcastFn;
            if (bf && vaka) {
                bf({
                    type: "vaka:assign",
                    payload: {
                        vakaId: id,
                        birimId: vaka.birimId,
                        baslik: bildirim.baslik,
                        icerik: bildirim.icerik,
                        seviye: bildirim.seviye,
                        zaman: bildirim.zaman
                    }
                });
            }
        },
        changeVakaDurum: (id, durum, not)=>{
            set((s)=>({
                    vakalar: s.vakalar.map((v)=>v.id === id ? {
                            ...v,
                            durum,
                            aciklama: not ? `${v.aciklama}\n\n[Güncelleme]: ${not}` : v.aciklama
                        } : v)
                }));
            const vaka = get().vakalar.find((v)=>v.id === id);
            const bildirim = {
                id: `B-${Date.now()}`,
                baslik: `Vaka durumu: ${durum.toUpperCase()}`,
                icerik: `${id} vakası "${durum}" durumuna güncellendi.`,
                seviye: "bilgi",
                zaman: new Date().toISOString(),
                okundu: false
            };
            get().addBildirim(bildirim);
            const bf = get().broadcastFn;
            if (bf && vaka) {
                bf({
                    type: "vaka:durum",
                    payload: {
                        vakaId: id,
                        birimId: vaka.birimId,
                        baslik: bildirim.baslik,
                        icerik: bildirim.icerik,
                        seviye: bildirim.seviye,
                        zaman: bildirim.zaman
                    }
                });
            }
        },
        closeVaka: (id, cozumNotu)=>{
            set((s)=>({
                    vakalar: s.vakalar.map((v)=>v.id === id ? {
                            ...v,
                            durum: "cozuldu",
                            aciklama: `${v.aciklama}\n\n[Çözüm notu]: ${cozumNotu}`
                        } : v)
                }));
            // Ekip müsait hale gelsin
            const vaka = get().vakalar.find((v)=>v.id === id);
            if (vaka?.atananEkip) {
                set((s)=>({
                        ekipler: s.ekipler.map((e)=>e.id === vaka.atananEkip ? {
                                ...e,
                                durum: "musait"
                            } : e)
                    }));
            }
            const bildirim = {
                id: `B-${Date.now()}`,
                baslik: "Vaka kapatıldı ✓",
                icerik: `${id} — çözüldü. Not: ${cozumNotu.slice(0, 100)}${cozumNotu.length > 100 ? "..." : ""}`,
                seviye: "bilgi",
                zaman: new Date().toISOString(),
                okundu: false
            };
            get().addBildirim(bildirim);
            const bf = get().broadcastFn;
            if (bf && vaka) {
                bf({
                    type: "vaka:close",
                    payload: {
                        vakaId: id,
                        birimId: vaka.birimId,
                        baslik: bildirim.baslik,
                        icerik: bildirim.icerik,
                        seviye: bildirim.seviye,
                        zaman: bildirim.zaman
                    }
                });
            }
        },
        // Vaka silme — kalıcı olarak kaldırır (geri alınamaz)
        deleteVaka: (id)=>{
            // Önce silinecek vakayı bul (hala store'da varken)
            const vaka = get().vakalar.find((v)=>v.id === id);
            set((s)=>({
                    vakalar: s.vakalar.filter((v)=>v.id !== id)
                }));
            // İlgili ekip müsait hale gelsin
            if (vaka?.atananEkip) {
                set((s)=>({
                        ekipler: s.ekipler.map((e)=>e.id === vaka.atananEkip ? {
                                ...e,
                                durum: "musait"
                            } : e)
                    }));
            }
            get().addBildirim({
                id: `B-${Date.now()}`,
                baslik: "Vaka silindi",
                icerik: `${id} kaydı sistemden kalıcı olarak kaldırıldı.`,
                seviye: "uyari",
                zaman: new Date().toISOString(),
                okundu: false
            });
        },
        // --- Ekip mutasyonları ---
        updateEkipDurum: (id, durum)=>set((s)=>({
                    ekipler: s.ekipler.map((e)=>e.id === id ? {
                            ...e,
                            durum
                        } : e)
                })),
        addEkip: (ekip)=>set((s)=>({
                    ekipler: [
                        ekip,
                        ...s.ekipler
                    ]
                })),
        deleteEkip: (id)=>set((s)=>({
                    ekipler: s.ekipler.filter((e)=>e.id !== id)
                })),
        // --- Mahalle mutasyonları ---
        addMahalle: (mahalle)=>set((s)=>({
                    mahalleler: [
                        ...s.mahalleler,
                        mahalle
                    ]
                })),
        deleteMahalle: (id)=>set((s)=>({
                    mahalleler: s.mahalleler.filter((m)=>m.id !== id)
                })),
        // --- Araç mutasyonları ---
        addArac: (arac)=>set((s)=>({
                    araclar: [
                        arac,
                        ...s.araclar
                    ]
                })),
        deleteArac: (id)=>set((s)=>({
                    araclar: s.araclar.filter((a)=>a.id !== id)
                })),
        // --- Bildirim mutasyonları ---
        addBildirim: (bildirim)=>set((s)=>({
                    bildirimler: [
                        bildirim,
                        ...s.bildirimler
                    ].slice(0, 50)
                })),
        markBildirimOkundu: (id)=>set((s)=>({
                    bildirimler: s.bildirimler.map((b)=>b.id === id ? {
                            ...b,
                            okundu: true
                        } : b)
                })),
        markAllBildirimOkundu: ()=>set((s)=>({
                    bildirimler: s.bildirimler.map((b)=>({
                            ...b,
                            okundu: true
                        }))
                })),
        // --- Evrak mutasyonları ---
        addEvrak: (evrak)=>set((s)=>({
                    evraklar: [
                        evrak,
                        ...s.evraklar
                    ]
                })),
        updateEvrakDurum: (id, durum)=>set((s)=>({
                    evraklar: s.evraklar.map((e)=>e.id === id ? {
                            ...e,
                            durum
                        } : e)
                })),
        deleteEvrak: (id)=>set((s)=>({
                    evraklar: s.evraklar.filter((e)=>e.id !== id)
                })),
        // --- Denetim mutasyonları ---
        addDenetim: (denetim)=>set((s)=>({
                    denetimler: [
                        denetim,
                        ...s.denetimler
                    ]
                })),
        deleteDenetim: (id)=>set((s)=>({
                    denetimler: s.denetimler.filter((d)=>d.id !== id)
                })),
        // --- Su Arıza mutasyonları ---
        addSuAriza: (kayit)=>set((s)=>({
                    suAriza: [
                        kayit,
                        ...s.suAriza
                    ]
                })),
        // --- Yardımcılar ---
        getVakalarByBirim: (birimId)=>{
            const all = get().vakalar;
            if (birimId === "operasyon") return all;
            return all.filter((v)=>v.birimId === birimId);
        },
        getEkilerByBirim: (birimId)=>{
            const all = get().ekipler;
            if (birimId === "operasyon") return all;
            return all.filter((e)=>e.birimId === birimId);
        },
        resetToSeed: ()=>set({
                ...initialState
            })
    }), {
    name: "kovancilar-bsm-store",
    // Sadece veriyi persist et (fonksiyonları değil)
    partialize: (s)=>({
            vakalar: s.vakalar,
            ekipler: s.ekipler,
            bildirimler: s.bildirimler,
            denetimler: s.denetimler,
            suAriza: s.suAriza,
            evraklar: s.evraklar,
            mahalleler: s.mahalleler,
            araclar: s.araclar
        }),
    version: 3
}));
;
function generateVakaId() {
    return `V-2026-${Math.floor(1000 + Math.random() * 8999)}`;
}
function generateBildirimId() {
    return `B-${Date.now()}`;
}
}),
"[project]/src/lib/pdf-rapor.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateAylıkFaaliyetRaporu",
    ()=>generateAylıkFaaliyetRaporu,
    "generateEvrakPDF",
    ()=>generateEvrakPDF,
    "generateVakaPDF",
    ()=>generateVakaPDF
]);
// Kovancılar Belediyesi · Saha Operasyon Merkezi
// PDF rapor üreticisi — Türkçe karakter desteği için DejaVu Sans fontu gömülü.
// Fontu runtime'da fetch ile yükler (TTF binary → base64 → jsPDF VFS).
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-ssr] (ecmascript)");
;
;
;
;
// --- Font yükleme (runtime fetch + base64) ---
let fontCache = null;
async function loadFontBase64(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Font yüklenemedi: ${url} (${res.status})`);
    }
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 0x8000; // 32KB chunk
    for(let i = 0; i < bytes.length; i += chunkSize){
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
}
async function ensureFontsLoaded() {
    if (fontCache) return fontCache;
    const [normal, bold] = await Promise.all([
        loadFontBase64("/fonts/DejaVuSans.ttf"),
        loadFontBase64("/fonts/DejaVuSans-Bold.ttf")
    ]);
    fontCache = {
        normal,
        bold
    };
    return fontCache;
}
async function createPdfWithFonts() {
    const fonts = await ensureFontsLoaded();
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsPDF"]({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
    // Fontları VFS'e ekle
    doc.addFileToVFS("DejaVuSans.ttf", fonts.normal);
    doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
    doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    doc.addFont("DejaVuSans-Bold.ttf", "DejaVuSans", "bold");
    doc.setFont("DejaVuSans");
    return doc;
}
// --- Yardımcı: kapak sayfası çiz ---
function drawCoverPage(doc, baslik, altBaslik, uretenAd, uretenSicil, uretenBirimAdi, ayYil) {
    const sayfaGenislik = doc.internal.pageSize.getWidth();
    const margin = 14;
    // Koyu lacivert arka plan — üst kısım
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, sayfaGenislik, 50, "F");
    // Başlık (beyaz)
    doc.setFont("DejaVuSans", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("KOVANCILAR BELEDİYESİ", margin, 20);
    doc.setFont("DejaVuSans", "normal");
    doc.setTextColor(96, 165, 250);
    doc.setFontSize(11);
    doc.text("Belediye Saha Operasyon Merkezi", margin, 28);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.text("KOVANCILAR / ELAZIĞ · 38.4237° K · 27.1428° D", margin, 34);
    doc.text("Birim İzole Personel Giriş Sistemi · v1.1", margin, 39);
    doc.setTextColor(255, 255, 255);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(14);
    doc.text(baslik, margin, 46);
    // Sağ üstte dönem ve kullanıcı bilgisi
    doc.setTextColor(96, 165, 250);
    doc.setFontSize(11);
    doc.text(ayYil, sayfaGenislik - margin, 20, {
        align: "right"
    });
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`Oluşturan: ${uretenAd} (Sicil: ${uretenSicil})`, sayfaGenislik - margin, 27, {
        align: "right"
    });
    doc.text(uretenBirimAdi, sayfaGenislik - margin, 32, {
        align: "right"
    });
    doc.text(`Tarih: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(new Date().toISOString())}`, sayfaGenislik - margin, 37, {
        align: "right"
    });
}
async function generateAylıkFaaliyetRaporu(veri) {
    const doc = await createPdfWithFonts();
    const sayfaGenislik = doc.internal.pageSize.getWidth();
    const margin = 14;
    drawCoverPage(doc, "AYLIK FAALİYET RAPORU", "", veri.uretenAdSoyad, veri.uretenSicil, veri.uretenBirimAdi, veri.ayYil);
    let y = 60;
    // 1. GENEL BAKIŞ
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("1. GENEL BAKIŞ", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 6;
    const toplam = veri.vakalar.length;
    const acil = veri.vakalar.filter((v)=>v.oncelik === "kritik" && v.durum !== "cozuldu").length;
    const cozuldu = veri.vakalar.filter((v)=>v.durum === "cozuldu").length;
    const devam = veri.vakalar.filter((v)=>v.durum === "devam-ediyor" || v.durum === "atandi").length;
    const yeni = veri.vakalar.filter((v)=>v.durum === "yeni").length;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        head: [
            [
                "Metrik",
                "Değer"
            ]
        ],
        body: [
            [
                "Toplam Vaka",
                String(toplam)
            ],
            [
                "Acil (Kritik - çözülmemiş)",
                String(acil)
            ],
            [
                "Devam eden",
                String(devam)
            ],
            [
                "Yeni (atanmamış)",
                String(yeni)
            ],
            [
                "Çözülen",
                String(cozuldu)
            ],
            [
                "Birim sayısı",
                String(veri.birimSayisi)
            ],
            [
                "Personel sayısı",
                String(veri.personelSayisi)
            ],
            [
                "Aktif ekip sayısı",
                String(veri.ekipler.filter((e)=>e.durum === "gorevde").length)
            ],
            [
                "Toplam evrak kaydı",
                String(veri.evraklar.length)
            ]
        ],
        headStyles: {
            fillColor: [
                37,
                99,
                235
            ],
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: "bold",
            fontSize: 9,
            font: "DejaVuSans"
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [
                15,
                23,
                42
            ],
            font: "DejaVuSans"
        },
        alternateRowStyles: {
            fillColor: [
                241,
                245,
                249
            ]
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // @ts-expect-error — autoTable tip tanımsız son ekliyor
    y = doc.lastAutoTable.finalY + 10;
    // 2. BİRİM BAZLI DAĞILIM
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("2. BİRİM BAZLI VAKA DAĞILIMI", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 4;
    const birimler = Array.from(new Set(veri.vakalar.map((v)=>v.birimId)));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        head: [
            [
                "Birim",
                "Vaka Sayısı",
                "Çözülen",
                "Devam Eden",
                "Acil"
            ]
        ],
        body: birimler.map((bId)=>{
            const bVakalar = veri.vakalar.filter((v)=>v.birimId === bId);
            return [
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBirim"])(bId).ad,
                String(bVakalar.length),
                String(bVakalar.filter((v)=>v.durum === "cozuldu").length),
                String(bVakalar.filter((v)=>v.durum === "devam-ediyor" || v.durum === "atandi").length),
                String(bVakalar.filter((v)=>v.oncelik === "kritik" && v.durum !== "cozuldu").length)
            ];
        }),
        headStyles: {
            fillColor: [
                37,
                99,
                235
            ],
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: "bold",
            fontSize: 9,
            font: "DejaVuSans"
        },
        bodyStyles: {
            fontSize: 9,
            font: "DejaVuSans"
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 10;
    if (y > 240) {
        doc.addPage();
        y = 20;
    }
    // 3. SON VAKA KAYITLARI
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("3. SON VAKA KAYITLARI (Son 20)", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 4;
    const sonVakalar = [
        ...veri.vakalar
    ].sort((a, b)=>new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime()).slice(0, 20);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        head: [
            [
                "Vaka No",
                "Birim",
                "Başlık",
                "Öncelik",
                "Durum",
                "Mahalle"
            ]
        ],
        body: sonVakalar.map((v)=>[
                v.id,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBirim"])(v.birimId).kisaAd,
                v.baslik.length > 30 ? v.baslik.slice(0, 30) + "..." : v.baslik,
                v.oncelik.toUpperCase(),
                v.durum.toUpperCase(),
                v.mahalle
            ]),
        headStyles: {
            fillColor: [
                37,
                99,
                235
            ],
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: "bold",
            fontSize: 8,
            font: "DejaVuSans"
        },
        bodyStyles: {
            fontSize: 8,
            font: "DejaVuSans"
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // 4. EVRAK ÖZETİ — yeni sayfa
    doc.addPage();
    y = 20;
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("4. EVRAK KAYIT ÖZETİ", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 4;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        head: [
            [
                "Evrak No",
                "Konu",
                "Gönderen",
                "Alıcı",
                "Durum",
                "Tarih"
            ]
        ],
        body: veri.evraklar.map((e)=>[
                e.evrakNo,
                e.konu.length > 30 ? e.konu.slice(0, 30) + "..." : e.konu,
                e.gonderen.length > 20 ? e.gonderen.slice(0, 20) + "..." : e.gonderen,
                e.alici.length > 20 ? e.alici.slice(0, 20) + "..." : e.alici,
                e.durum.toUpperCase(),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(e.tarih)
            ]),
        headStyles: {
            fillColor: [
                37,
                99,
                235
            ],
            textColor: [
                255,
                255,
                255
            ],
            fontSize: 8,
            font: "DejaVuSans"
        },
        bodyStyles: {
            fontSize: 8,
            font: "DejaVuSans"
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 15;
    if (y > 240) {
        doc.addPage();
        y = 20;
    }
    // 5. DEĞERLENDİRME
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("5. DEĞERLENDİRME", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 8;
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const cozulmeOrani = toplam > 0 ? (cozuldu / toplam * 100).toFixed(1) : "0";
    const degerlendirme = [
        `${veri.ayYil} döneminde Saha Operasyon Merkezi'ne ${toplam} vaka bildirilmiş, bunların ${cozuldu} tanesi çözülmüştür (%${cozulmeOrani} çözülme oranı).`,
        `Acil müdahale gerektiren ${acil} kritik vaka halen açık durumdadır; öncelikli olarak ele alınmalıdır.`,
        `Devam eden ${devam} vaka için saha ekiplerinin koordinasyonuna devam edilmektedir.`,
        `Toplam ${veri.personelSayisi} personel ${veri.birimSayisi} birimde görev yapmaktadır. Birim izolasyon prensibi korunmuştur.`,
        `Evrak kayıt sisteminde ${veri.evraklar.length} kayıt işlenmiştir; bunlardan ${veri.evraklar.filter((e)=>e.durum === "tamamlandi").length} tanesi tamamlanmıştır.`
    ];
    degerlendirme.forEach((satir)=>{
        const satirlar = doc.splitTextToSize(satir, sayfaGenislik - margin * 2);
        doc.text(satirlar, margin, y);
        y += satirlar.length * 5 + 2;
    });
    // İmza
    y += 20;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 60, y);
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(veri.uretenAdSoyad, margin, y + 5);
    doc.text(veri.uretenBirimAdi, margin, y + 10);
    doc.line(sayfaGenislik - margin - 60, y, sayfaGenislik - margin, y);
    doc.text("Onaylayan", sayfaGenislik - margin - 60, y + 5);
    doc.text("Belediye Başkanı", sayfaGenislik - margin - 60, y + 10);
    // Sayfa altlık
    const sayfaSayisi = doc.getNumberOfPages();
    for(let i = 1; i <= sayfaSayisi; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont("DejaVuSans", "normal");
        doc.text(`© ${new Date().getFullYear()} Kovancılar Belediyesi · Belediye Saha Operasyon Merkezi`, margin, doc.internal.pageSize.getHeight() - 8);
        doc.text(`Sayfa ${i} / ${sayfaSayisi}`, sayfaGenislik - margin, doc.internal.pageSize.getHeight() - 8, {
            align: "right"
        });
    }
    const dosyaAdi = `Kovancilar_Belediyesi_Aylik_Rapor_${veri.ayYil.replace(/\s/g, "_")}.pdf`;
    doc.save(dosyaAdi);
}
async function generateVakaPDF(vaka) {
    const doc = await createPdfWithFonts();
    const sayfaGenislik = doc.internal.pageSize.getWidth();
    const margin = 14;
    drawCoverPage(doc, "VAKA DETAY RAPORU", "", "Sistem Yöneticisi", "0001", (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBirim"])(vaka.birimId).ad, vaka.id);
    let y = 60;
    // Vaka başlık
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(14);
    doc.text(vaka.baslik, margin, y);
    y += 8;
    // Vaka bilgileri tablosu
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("VAKA BİLGİLERİ", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 4;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        body: [
            [
                "Vaka No",
                vaka.id
            ],
            [
                "Birim",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBirim"])(vaka.birimId).ad
            ],
            [
                "Kategori",
                vaka.kategori
            ],
            [
                "Öncelik",
                vaka.oncelik.toUpperCase()
            ],
            [
                "Durum",
                vaka.durum.toUpperCase()
            ],
            [
                "Mahalle",
                vaka.mahalle
            ],
            [
                "Adres",
                vaka.adres
            ],
            [
                "Oluşturma Zamanı",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(vaka.olusturmaZamani)
            ],
            ...vaka.atananEkip ? [
                [
                    "Atanan Ekip",
                    vaka.atananEkip
                ]
            ] : [],
            ...vaka.atananPersonel ? [
                [
                    "Atanan Personel",
                    vaka.atananPersonel
                ]
            ] : [],
            ...vaka.koordinat ? [
                [
                    "Koordinat",
                    `${vaka.koordinat.lat.toFixed(4)}°K, ${vaka.koordinat.lng.toFixed(4)}°D`
                ]
            ] : []
        ],
        bodyStyles: {
            fontSize: 10,
            textColor: [
                15,
                23,
                42
            ],
            font: "DejaVuSans"
        },
        columnStyles: {
            0: {
                fontStyle: "bold",
                cellWidth: 50
            }
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 10;
    // Açıklama
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("AÇIKLAMA", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 6;
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const aciklamaSatirlar = doc.splitTextToSize(vaka.aciklama, sayfaGenislik - margin * 2);
    doc.text(aciklamaSatirlar, margin, y);
    y += aciklamaSatirlar.length * 5 + 15;
    // İmza
    y += 15;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 60, y);
    doc.setFontSize(9);
    doc.text("Düzenleyen", margin, y + 5);
    doc.text("Tarih: " + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(new Date().toISOString()), margin, y + 10);
    doc.line(sayfaGenislik - margin - 60, y, sayfaGenislik - margin, y);
    doc.text("Onaylayan", sayfaGenislik - margin - 60, y + 5);
    doc.text("Belediye Başkanı", sayfaGenislik - margin - 60, y + 10);
    // Sayfa altlık
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`© ${new Date().getFullYear()} Kovancılar Belediyesi · Vaka Detay Raporu`, margin, doc.internal.pageSize.getHeight() - 8);
    doc.save(`Vaka_Detay_${vaka.id}.pdf`);
}
async function generateEvrakPDF(evrak) {
    const doc = await createPdfWithFonts();
    const sayfaGenislik = doc.internal.pageSize.getWidth();
    const margin = 14;
    drawCoverPage(doc, "EVRAK DETAY RAPORU", "", "Sistem Yöneticisi", "0001", "İdari İşler", evrak.evrakNo);
    let y = 60;
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(14);
    doc.text(evrak.konu, margin, y);
    y += 8;
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(12);
    doc.text("EVRAK BİLGİLERİ", margin, y);
    y += 4;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, sayfaGenislik - margin, y);
    y += 4;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        startY: y,
        body: [
            [
                "Evrak No",
                evrak.evrakNo
            ],
            [
                "Tip",
                evrak.tip
            ],
            [
                "Durum",
                evrak.durum.toUpperCase()
            ],
            [
                "Gönderen",
                evrak.gonderen
            ],
            [
                "Alıcı",
                evrak.alici
            ],
            [
                "Tarih",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(evrak.tarih)
            ]
        ],
        bodyStyles: {
            fontSize: 10,
            textColor: [
                15,
                23,
                42
            ],
            font: "DejaVuSans"
        },
        columnStyles: {
            0: {
                fontStyle: "bold",
                cellWidth: 50
            }
        },
        margin: {
            left: margin,
            right: margin
        },
        styles: {
            font: "DejaVuSans"
        }
    });
    // İmza
    // @ts-expect-error
    y = doc.lastAutoTable.finalY + 30;
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + 60, y);
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("Düzenleyen", margin, y + 5);
    doc.text("Tarih: " + (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTarih"])(new Date().toISOString()), margin, y + 10);
    doc.line(sayfaGenislik - margin - 60, y, sayfaGenislik - margin, y);
    doc.text("Onaylayan", sayfaGenislik - margin - 60, y + 5);
    doc.text("Belediye Başkanı", sayfaGenislik - margin - 60, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`© ${new Date().getFullYear()} Kovancılar Belediyesi · Evrak Detay Raporu`, margin, doc.internal.pageSize.getHeight() - 8);
    doc.save(`Evrak_${evrak.evrakNo}.pdf`);
}
}),
"[project]/src/hooks/use-notifications.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useNotifications",
    ()=>useNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm-debug/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
// Socket.io canlı bildirim servisi
//
// Vercel/serverless'da Socket.io çalışmaz. Bu yüzden:
// 1. NEXT_PUBLIC_SOCKET_URL tanımlıysa → ona bağlan (Render/Railway/Fly.io)
// 2. Tanımlı değilse → XTransformPort=3004 ile yerel Caddy gateway dene
// 3. Hiçbiri çalışmazsa → otomatik OFFLINE moduna düşer, uygulama lokal çalışır
const SOCKET_URL_FROM_ENV = process.env.NEXT_PUBLIC_SOCKET_URL || "";
// Yerel sandbox'ta Caddy XTransformPort forwarding'i kullanır
// Vercel/production'da env'ten gelen URL kullanılır
function buildSocketUrl() {
    if (SOCKET_URL_FROM_ENV && SOCKET_URL_FROM_ENV.length > 0) {
        return SOCKET_URL_FROM_ENV;
    }
    // Sandbox/local — Caddy gateway XTransformPort kullanır
    const SOCKET_PORT = 3004;
    return `/?XTransformPort=${SOCKET_PORT}`;
}
const SOCKET_URL = buildSocketUrl();
// Tek bir socket instance'ı paylaş — tüm hook çağrılarında aynı socket
let sharedSocket = null;
let sharedRefCount = 0;
let registeredUser = null;
function useNotifications(user) {
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [welcome, setWelcome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const socketRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const addBildirim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useOperasyonStore"])((s)=>s.addBildirim);
    const markBildirimOkundu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useOperasyonStore"])((s)=>s.markBildirimOkundu);
    const markAllBildirimOkundu = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useOperasyonStore"])((s)=>s.markAllBildirimOkundu);
    // WebSocket bağlantısını kur
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!user) return;
        sharedRefCount += 1;
        registeredUser = {
            sicil: user.sicil,
            birimId: user.birimId
        };
        if (!sharedSocket) {
            try {
                sharedSocket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2d$debug$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])(SOCKET_URL, {
                    transports: [
                        "websocket",
                        "polling"
                    ],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 3000,
                    timeout: 5000,
                    // Bağlantı başarısız olursa sessizce offline modda kal
                    autoConnect: true,
                    forceNew: false
                });
            } catch (e) {
                // Vercel/serverless'ta Socket.io yok — sessizce offline modda çalış
                console.warn("[ws] Socket.io bağlantısı kurulamadı, offline modda çalışılıyor.");
                return;
            }
        }
        const socket = sharedSocket;
        socketRef.current = socket;
        const onConnect = ()=>{
            setConnected(true);
            // Kimlik bilgisi gönder
            socket.emit("register", {
                sicil: user.sicil,
                birimId: user.birimId
            });
        };
        const onDisconnect = ()=>{
            setConnected(false);
        };
        const onWelcome = (data)=>{
            setWelcome(data);
        };
        const onNotification = (event)=>{
            // Yeni bildirimi store'a ekle
            const yeniBildirim = {
                id: `B-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                baslik: event.payload.baslik,
                icerik: event.payload.icerik,
                seviye: event.payload.seviye,
                zaman: event.payload.zaman,
                okundu: false
            };
            addBildirim(yeniBildirim);
            // Toast ile anlık göster
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"])({
                title: event.payload.baslik,
                description: event.payload.icerik,
                variant: event.payload.seviye === "kritik" ? "destructive" : "default"
            });
        };
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("welcome", onWelcome);
        socket.on("notification:new", onNotification);
        // Eğer zaten bağlıysa hemen register et
        if (socket.connected) {
            onConnect();
        }
        return ()=>{
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("welcome", onWelcome);
            socket.off("notification:new", onNotification);
            sharedRefCount -= 1;
            if (sharedRefCount <= 0 && sharedSocket) {
                sharedSocket.disconnect();
                sharedSocket = null;
                sharedRefCount = 0;
            }
        };
    }, [
        user,
        addBildirim
    ]);
    // Server'a broadcast yollama fonksiyonu
    function broadcast(event) {
        if (!socketRef.current?.connected) {
            console.warn("[ws] Socket bağlı değil, broadcast gönderilemedi.");
            return false;
        }
        socketRef.current.emit("broadcast:event", {
            ...event,
            payload: {
                seviye: event.payload.seviye ?? "bilgi",
                zaman: event.payload.zaman ?? new Date().toISOString(),
                kaynak: registeredUser?.sicil,
                ...event.payload
            }
        });
        return true;
    }
    return {
        connected,
        welcome,
        bagliClientSayisi: welcome?.bagliClientSayisi ?? 0,
        broadcast,
        markBildirimOkundu,
        markAllBildirimOkundu
    };
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$login$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/login-screen.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$app$2d$shell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/app-shell.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$operasyon$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboards/operasyon-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$fen$2d$isleri$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboards/fen-isleri-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$zabita$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboards/zabita-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$altyapi$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboards/altyapi-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$idari$2d$isler$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboards/idari-isler-dashboard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.js [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-chart-column-increasing.js [app-ssr] (ecmascript) <export default as FileBarChart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$construction$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Construction$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/construction.js [app-ssr] (ecmascript) <export default as Construction>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/footprints.js [app-ssr] (ecmascript) <export default as Footprints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-ssr] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/store.js [app-ssr] (ecmascript) <export default as Store>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/inbox.js [app-ssr] (ecmascript) <export default as Inbox>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/archive.js [app-ssr] (ecmascript) <export default as Archive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/droplets.js [app-ssr] (ecmascript) <export default as Droplets>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waves.js [app-ssr] (ecmascript) <export default as Waves>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-ssr] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/test-tube.js [app-ssr] (ecmascript) <export default as TestTube>");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
// Birim bazlı sidebar modül konfigürasyonu
const BIRIM_MODULE_MAP = {
    operasyon: [
        {
            id: "genel",
            label: "Genel Bakış",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        },
        {
            id: "harita",
            label: "Saha Haritası",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"]
        },
        {
            id: "ekipler",
            label: "Ekipler",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
        },
        {
            id: "araclar",
            label: "Araç Filosu",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"]
        },
        {
            id: "vakalar",
            label: "Tüm Vakalar",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"]
        },
        {
            id: "raporlar",
            label: "Raporlar",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$chart$2d$column$2d$increasing$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileBarChart$3e$__["FileBarChart"]
        },
        {
            id: "yonetim",
            label: "Kayıt Yönetimi",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"]
        }
    ],
    "fen-isleri": [
        {
            id: "genel",
            label: "Genel Bakış",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        },
        {
            id: "yol",
            label: "Yol Hasarları",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$construction$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Construction$3e$__["Construction"]
        },
        {
            id: "kaldirim",
            label: "Kaldırım",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$footprints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Footprints$3e$__["Footprints"]
        },
        {
            id: "parke",
            label: "Parke",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"]
        },
        {
            id: "ekipler",
            label: "Ekipler",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
        },
        {
            id: "yeni-vaka",
            label: "Yeni Vaka",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"]
        }
    ],
    zabita: [
        {
            id: "genel",
            label: "Genel Bakış",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        },
        {
            id: "denetimler",
            label: "Denetimler",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$store$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Store$3e$__["Store"]
        },
        {
            id: "cezalar",
            label: "Ceza Kayıtları",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"]
        },
        {
            id: "sikayetler",
            label: "Şikayetler",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
        },
        {
            id: "ekipler",
            label: "Saha Ekipleri",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
        }
    ],
    altyapi: [
        {
            id: "genel",
            label: "Genel Bakış",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        },
        {
            id: "su-ariza",
            label: "Su Arızaları",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$droplets$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Droplets$3e$__["Droplets"]
        },
        {
            id: "kanalizasyon",
            label: "Kanalizasyon",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waves$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Waves$3e$__["Waves"]
        },
        {
            id: "vana-takip",
            label: "Vana Takibi",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"]
        },
        {
            id: "ekipler",
            label: "Ekipler",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
        },
        {
            id: "numune",
            label: "Numune Analizi",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__["TestTube"]
        }
    ],
    "idari-isler": [
        {
            id: "genel",
            label: "Genel Bakış",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"]
        },
        {
            id: "evrak",
            label: "Evrak Kayıt",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$inbox$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Inbox$3e$__["Inbox"]
        },
        {
            id: "raporlar",
            label: "Raporlar",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
        },
        {
            id: "arsiv",
            label: "Arşiv",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"]
        },
        {
            id: "personel",
            label: "Personel",
            ikon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
        }
    ]
};
// Birim bazlı vaka sayacı — Zustand store'dan canlı veri alır
// (mock-data yerine; yeni vakalar sidebar'da anlık sayılır)
function useBirimVakaSayisi(birimId) {
    const vakalar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useOperasyonStore"])((s)=>s.vakalar);
    if (birimId === "operasyon") {
        return vakalar.filter((v)=>v.durum !== "cozuldu" && v.durum !== "iptal").length;
    }
    return vakalar.filter((v)=>v.birimId === birimId && v.durum !== "cozuldu" && v.durum !== "iptal").length;
}
function Home() {
    // Hydration güvenliği: ilk render'da login ekranını gösteriyoruz, sonra session kontrolü
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeModule, setActiveModule] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("genel");
    // Canlı vaka sayacı — erken dönüşlerden önce çağrılması zorunlu (hook kuralı)
    // user null ise bu değer login ekranında kullanılmaz, ama hook çağrı sırası korunur
    const acikVakaSayisi = useBirimVakaSayisi(user?.birimId ?? "operasyon");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Mount tespiti — Next.js'te 'use client' bileşeninde localStorage erişimi
        // için gerekli standart pattern. İlk client render'da çalışır, tekrar tetiklenmez.
        // Lint kuralı cascading render endişesi taşır ama bu tek seferlik mount
        // bayrağıdır ve güvenlidir.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadSession"])();
        if (session) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(session);
        }
    }, []);
    function handleLogin(sessionUser) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveSession"])(sessionUser);
        setUser(sessionUser);
        setActiveModule("genel");
    }
    function handleLogout() {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSession"])();
        setUser(null);
    }
    // Birim değiştiğinde modülü sıfırla — render sırasında modülü
    // birime göre türetiyoruz, setState'i effect içinde çağırmıyoruz
    // (ileride "genel" dışında bir modülde login yapılırsa eski birimden kalan
    // modül kimliği kalabilir; bunu handleLogin içinde "genel" olarak
    // sıfırlayarak çözüyoruz, ek effect gerekmiyor).
    // SSR/hydration: mount olmadan önce minimal bir placeholder göster
    if (!mounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                backgroundColor: "#0B1120",
                minHeight: "100vh",
                width: "100%"
            }
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 147,
            columnNumber: 7
        }, this);
    }
    // Login ekranı
    if (!user) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$login$2d$screen$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoginScreen"], {
            onLogin: handleLogin
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 159,
            columnNumber: 12
        }, this);
    }
    // Birim paneli — Zustand store'dan canlı vaka sayısı (hook yukarıda çağrıldı)
    const birim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBirim"])(user.birimId);
    const sidebarItems = BIRIM_MODULE_MAP[user.birimId].map((item)=>{
        if (item.id === "vakalar" || item.id === "sikayetler" || item.id === "yol" || item.id === "kaldirim" || item.id === "parke" || item.id === "su-ariza" || item.id === "kanalizasyon") {
            if (acikVakaSayisi > 0) return {
                ...item,
                count: acikVakaSayisi
            };
        }
        return item;
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$app$2d$shell$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AppShell"], {
        user: user,
        sidebarItems: sidebarItems,
        activeModule: activeModule,
        onModuleChange: setActiveModule,
        onLogout: handleLogout,
        children: renderDashboard(user, activeModule, setActiveModule)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 182,
        columnNumber: 5
    }, this);
}
function renderDashboard(user, module, onModuleChange) {
    switch(user.birimId){
        case "operasyon":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$operasyon$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OperasyonDashboard"], {
                user: user,
                activeModule: module,
                onModuleChange: onModuleChange
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 198,
                columnNumber: 9
            }, this);
        case "fen-isleri":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$fen$2d$isleri$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FenIsleriDashboard"], {
                user: user,
                activeModule: module,
                onModuleChange: onModuleChange
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 206,
                columnNumber: 9
            }, this);
        case "zabita":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$zabita$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ZabitaDashboard"], {
                user: user,
                activeModule: module,
                onModuleChange: onModuleChange
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 214,
                columnNumber: 9
            }, this);
        case "altyapi":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$altyapi$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AltyapiDashboard"], {
                user: user,
                activeModule: module,
                onModuleChange: onModuleChange
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 222,
                columnNumber: 9
            }, this);
        case "idari-isler":
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboards$2f$idari$2d$isler$2d$dashboard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["IdariIslerDashboard"], {
                user: user,
                activeModule: module,
                onModuleChange: onModuleChange
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 230,
                columnNumber: 9
            }, this);
        default:
            return null;
    }
}
}),
];

//# sourceMappingURL=src_d8d16f8a._.js.map