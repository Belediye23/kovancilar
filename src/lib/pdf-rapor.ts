// Kovancılar Belediyesi · Saha Operasyon Merkezi
// PDF rapor üreticisi — Türkçe karakter desteği için DejaVu Sans fontu gömülü.
// Fontu runtime'da fetch ile yükler (TTF binary → base64 → jsPDF VFS).

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Vaka, Evrak, Ekip, Bildirim } from "@/lib/types";
import { getBirim } from "@/lib/auth";
import { formatTarih } from "@/lib/mock-data";

// --- Font yükleme (runtime fetch + base64) ---

let fontCache: { normal: string; bold: string } | null = null;

async function loadFontBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Font yüklenemedi: ${url} (${res.status})`);
  }
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 0x8000; // 32KB chunk
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk) as number[]);
  }
  return btoa(binary);
}

async function ensureFontsLoaded(): Promise<{ normal: string; bold: string }> {
  if (fontCache) return fontCache;
  const [normal, bold] = await Promise.all([
    loadFontBase64("/fonts/DejaVuSans.ttf"),
    loadFontBase64("/fonts/DejaVuSans-Bold.ttf"),
  ]);
  fontCache = { normal, bold };
  return fontCache;
}

async function createPdfWithFonts(): Promise<jsPDF> {
  const fonts = await ensureFontsLoaded();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
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

function drawCoverPage(
  doc: jsPDF,
  baslik: string,
  altBaslik: string,
  uretenAd: string,
  uretenSicil: string,
  uretenBirimAdi: string,
  ayYil: string
) {
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
  doc.text(ayYil, sayfaGenislik - margin, 20, { align: "right" });
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(`Oluşturan: ${uretenAd} (Sicil: ${uretenSicil})`, sayfaGenislik - margin, 27, { align: "right" });
  doc.text(uretenBirimAdi, sayfaGenislik - margin, 32, { align: "right" });
  doc.text(`Tarih: ${formatTarih(new Date().toISOString())}`, sayfaGenislik - margin, 37, { align: "right" });
}

// --- Aylık Faaliyet Raporu ---

interface RaporVerisi {
  ayYil: string;
  uretenAdSoyad: string;
  uretenSicil: string;
  uretenBirimAdi: string;
  vakalar: Vaka[];
  evraklar: Evrak[];
  ekipler: Ekip[];
  birimSayisi: number;
  personelSayisi: number;
}

export async function generateAylıkFaaliyetRaporu(veri: RaporVerisi): Promise<void> {
  const doc = await createPdfWithFonts();
  const sayfaGenislik = doc.internal.pageSize.getWidth();
  const margin = 14;

  drawCoverPage(
    doc,
    "AYLIK FAALİYET RAPORU",
    "",
    veri.uretenAdSoyad,
    veri.uretenSicil,
    veri.uretenBirimAdi,
    veri.ayYil
  );

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
  const acil = veri.vakalar.filter(
    (v) => v.oncelik === "kritik" && v.durum !== "cozuldu"
  ).length;
  const cozuldu = veri.vakalar.filter((v) => v.durum === "cozuldu").length;
  const devam = veri.vakalar.filter(
    (v) => v.durum === "devam-ediyor" || v.durum === "atandi"
  ).length;
  const yeni = veri.vakalar.filter((v) => v.durum === "yeni").length;

  autoTable(doc, {
    startY: y,
    head: [["Metrik", "Değer"]],
    body: [
      ["Toplam Vaka", String(toplam)],
      ["Acil (Kritik - çözülmemiş)", String(acil)],
      ["Devam eden", String(devam)],
      ["Yeni (atanmamış)", String(yeni)],
      ["Çözülen", String(cozuldu)],
      ["Birim sayısı", String(veri.birimSayisi)],
      ["Personel sayısı", String(veri.personelSayisi)],
      ["Aktif ekip sayısı", String(veri.ekipler.filter((e) => e.durum === "gorevde").length)],
      ["Toplam evrak kaydı", String(veri.evraklar.length)],
    ],
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, font: "DejaVuSans" },
    bodyStyles: { fontSize: 9, textColor: [15, 23, 42], font: "DejaVuSans" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
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

  const birimler = Array.from(new Set(veri.vakalar.map((v) => v.birimId))) as Array<
    "operasyon" | "fen-isleri" | "zabita" | "altyapi" | "idari-isler"
  >;

  autoTable(doc, {
    startY: y,
    head: [["Birim", "Vaka Sayısı", "Çözülen", "Devam Eden", "Acil"]],
    body: birimler.map((bId) => {
      const bVakalar = veri.vakalar.filter((v) => v.birimId === bId);
      return [
        getBirim(bId).ad,
        String(bVakalar.length),
        String(bVakalar.filter((v) => v.durum === "cozuldu").length),
        String(bVakalar.filter((v) => v.durum === "devam-ediyor" || v.durum === "atandi").length),
        String(bVakalar.filter((v) => v.oncelik === "kritik" && v.durum !== "cozuldu").length),
      ];
    }),
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9, font: "DejaVuSans" },
    bodyStyles: { fontSize: 9, font: "DejaVuSans" },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
  });

  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 10;

  if (y > 240) { doc.addPage(); y = 20; }

  // 3. SON VAKA KAYITLARI
  doc.setTextColor(15, 23, 42);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(12);
  doc.text("3. SON VAKA KAYITLARI (Son 20)", margin, y);
  y += 4;
  doc.setDrawColor(59, 130, 246);
  doc.line(margin, y, sayfaGenislik - margin, y);
  y += 4;

  const sonVakalar = [...veri.vakalar]
    .sort((a, b) => new Date(b.olusturmaZamani).getTime() - new Date(a.olusturmaZamani).getTime())
    .slice(0, 20);

  autoTable(doc, {
    startY: y,
    head: [["Vaka No", "Birim", "Başlık", "Öncelik", "Durum", "Mahalle"]],
    body: sonVakalar.map((v) => [
      v.id,
      getBirim(v.birimId).kisaAd,
      v.baslik.length > 30 ? v.baslik.slice(0, 30) + "..." : v.baslik,
      v.oncelik.toUpperCase(),
      v.durum.toUpperCase(),
      v.mahalle,
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8, font: "DejaVuSans" },
    bodyStyles: { fontSize: 8, font: "DejaVuSans" },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
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

  autoTable(doc, {
    startY: y,
    head: [["Evrak No", "Konu", "Gönderen", "Alıcı", "Durum", "Tarih"]],
    body: veri.evraklar.map((e) => [
      e.evrakNo,
      e.konu.length > 30 ? e.konu.slice(0, 30) + "..." : e.konu,
      e.gonderen.length > 20 ? e.gonderen.slice(0, 20) + "..." : e.gonderen,
      e.alici.length > 20 ? e.alici.slice(0, 20) + "..." : e.alici,
      e.durum.toUpperCase(),
      formatTarih(e.tarih),
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 8, font: "DejaVuSans" },
    bodyStyles: { fontSize: 8, font: "DejaVuSans" },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
  });

  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 15;

  if (y > 240) { doc.addPage(); y = 20; }

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

  const cozulmeOrani = toplam > 0 ? ((cozuldu / toplam) * 100).toFixed(1) : "0";
  const degerlendirme = [
    `${veri.ayYil} döneminde Saha Operasyon Merkezi'ne ${toplam} vaka bildirilmiş, bunların ${cozuldu} tanesi çözülmüştür (%${cozulmeOrani} çözülme oranı).`,
    `Acil müdahale gerektiren ${acil} kritik vaka halen açık durumdadır; öncelikli olarak ele alınmalıdır.`,
    `Devam eden ${devam} vaka için saha ekiplerinin koordinasyonuna devam edilmektedir.`,
    `Toplam ${veri.personelSayisi} personel ${veri.birimSayisi} birimde görev yapmaktadır. Birim izolasyon prensibi korunmuştur.`,
    `Evrak kayıt sisteminde ${veri.evraklar.length} kayıt işlenmiştir; bunlardan ${veri.evraklar.filter((e) => e.durum === "tamamlandi").length} tanesi tamamlanmıştır.`,
  ];

  degerlendirme.forEach((satir) => {
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
  for (let i = 1; i <= sayfaSayisi; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("DejaVuSans", "normal");
    doc.text(
      `© ${new Date().getFullYear()} Kovancılar Belediyesi · Belediye Saha Operasyon Merkezi`,
      margin,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Sayfa ${i} / ${sayfaSayisi}`,
      sayfaGenislik - margin,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" }
    );
  }

  const dosyaAdi = `Kovancilar_Belediyesi_Aylik_Rapor_${veri.ayYil.replace(/\s/g, "_")}.pdf`;
  doc.save(dosyaAdi);
}

// --- Vaka Detay PDF'i (tek vaka için) ---

export async function generateVakaPDF(vaka: Vaka): Promise<void> {
  const doc = await createPdfWithFonts();
  const sayfaGenislik = doc.internal.pageSize.getWidth();
  const margin = 14;

  drawCoverPage(
    doc,
    "VAKA DETAY RAPORU",
    "",
    "Sistem Yöneticisi",
    "0001",
    getBirim(vaka.birimId).ad,
    vaka.id
  );

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

  autoTable(doc, {
    startY: y,
    body: [
      ["Vaka No", vaka.id],
      ["Birim", getBirim(vaka.birimId).ad],
      ["Kategori", vaka.kategori],
      ["Öncelik", vaka.oncelik.toUpperCase()],
      ["Durum", vaka.durum.toUpperCase()],
      ["Mahalle", vaka.mahalle],
      ["Adres", vaka.adres],
      ["Oluşturma Zamanı", formatTarih(vaka.olusturmaZamani)],
      ...(vaka.atananEkip ? [["Atanan Ekip", vaka.atananEkip] as [string, string]] : []),
      ...(vaka.atananPersonel ? [["Atanan Personel", vaka.atananPersonel] as [string, string]] : []),
      ...(vaka.koordinat ? [["Koordinat", `${vaka.koordinat.lat.toFixed(4)}°K, ${vaka.koordinat.lng.toFixed(4)}°D`] as [string, string]] : []),
    ],
    bodyStyles: { fontSize: 10, textColor: [15, 23, 42], font: "DejaVuSans" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
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
  doc.text("Tarih: " + formatTarih(new Date().toISOString()), margin, y + 10);

  doc.line(sayfaGenislik - margin - 60, y, sayfaGenislik - margin, y);
  doc.text("Onaylayan", sayfaGenislik - margin - 60, y + 5);
  doc.text("Belediye Başkanı", sayfaGenislik - margin - 60, y + 10);

  // Sayfa altlık
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `© ${new Date().getFullYear()} Kovancılar Belediyesi · Vaka Detay Raporu`,
    margin,
    doc.internal.pageSize.getHeight() - 8
  );

  doc.save(`Vaka_Detay_${vaka.id}.pdf`);
}

// --- Evrak Detay PDF'i ---

export async function generateEvrakPDF(evrak: Evrak): Promise<void> {
  const doc = await createPdfWithFonts();
  const sayfaGenislik = doc.internal.pageSize.getWidth();
  const margin = 14;

  drawCoverPage(
    doc,
    "EVRAK DETAY RAPORU",
    "",
    "Sistem Yöneticisi",
    "0001",
    "İdari İşler",
    evrak.evrakNo
  );

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

  autoTable(doc, {
    startY: y,
    body: [
      ["Evrak No", evrak.evrakNo],
      ["Tip", evrak.tip],
      ["Durum", evrak.durum.toUpperCase()],
      ["Gönderen", evrak.gonderen],
      ["Alıcı", evrak.alici],
      ["Tarih", formatTarih(evrak.tarih)],
    ],
    bodyStyles: { fontSize: 10, textColor: [15, 23, 42], font: "DejaVuSans" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: margin, right: margin },
    styles: { font: "DejaVuSans" },
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
  doc.text("Tarih: " + formatTarih(new Date().toISOString()), margin, y + 10);

  doc.line(sayfaGenislik - margin - 60, y, sayfaGenislik - margin, y);
  doc.text("Onaylayan", sayfaGenislik - margin - 60, y + 5);
  doc.text("Belediye Başkanı", sayfaGenislik - margin - 60, y + 10);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `© ${new Date().getFullYear()} Kovancılar Belediyesi · Evrak Detay Raporu`,
    margin,
    doc.internal.pageSize.getHeight() - 8
  );

  doc.save(`Evrak_${evrak.evrakNo}.pdf`);
}
