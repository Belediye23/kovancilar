"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Vaka, Evrak, Ekip } from "@/lib/types";
import { getBirim } from "@/lib/auth";
import { formatTarih } from "@/lib/mock-data";

// Kovancılar Belediyesi · Saha Operasyon Merkezi
// Aylık Faaliyet Raporu PDF üreticisi — tarayıcıda jsPDF ile çalışır.

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

export function generateAylıkFaaliyetRaporu(veri: RaporVerisi): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const sayfaGenislik = doc.internal.pageSize.getWidth();
  const margin = 14;
  const icerikGenislik = sayfaGenislik - margin * 2;

  // --- Kapak / Başlık bölümü ---
  doc.setFillColor(11, 17, 32); // #0B1120
  doc.rect(0, 0, sayfaGenislik, 50, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("KOVANCILAR BELEDİYESİ", margin, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(96, 165, 250); // blue-400
  doc.text("Belediye Saha Operasyon Merkezi", margin, 28);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(9);
  doc.text(
    "KOVANCILAR / ELAZIĞ · 38.4237° K · 27.1428° D",
    margin,
    34
  );
  doc.text(
    "Birim İzole Personel Giriş Sistemi · v1.1 (demo)",
    margin,
    39
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`AYLIK FAALİYET RAPORU`, margin, 46);

  // Sağ üstte dönem bilgisi
  doc.setTextColor(96, 165, 250);
  doc.setFontSize(11);
  doc.text(veri.ayYil, sayfaGenislik - margin, 20, { align: "right" });
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text(
    `Oluşturan: ${veri.uretenAdSoyad} (Sicil: ${veri.uretenSicil})`,
    sayfaGenislik - margin,
    27,
    { align: "right" }
  );
  doc.text(
    `${veri.uretenBirimAdi}`,
    sayfaGenislik - margin,
    32,
    { align: "right" }
  );
  doc.text(
    `Tarih: ${formatTarih(new Date().toISOString())}`,
    sayfaGenislik - margin,
    37,
    { align: "right" }
  );

  // --- Özet Kartları ---
  let y = 60;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. GENEL BAKIŞ", margin, y);
  y += 4;

  // Yatay çizgi
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
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249],
    },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error — autoTable tip tanımsız son ekliyor
  y = doc.lastAutoTable.finalY + 10;

  // --- Birim bazlı dağılım ---
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. BİRİM BAZLI VAKA DAĞILIMI", margin, y);
  y += 4;
  doc.setDrawColor(59, 130, 246);
  doc.line(margin, y, sayfaGenislik - margin, y);
  y += 4;

  const birimler = Array.from(
    new Set(veri.vakalar.map((v) => v.birimId))
  ) as ("operasyon" | "fen-isleri" | "zabita" | "altyapi" | "idari-isler")[];

  autoTable(doc, {
    startY: y,
    head: [["Birim", "Vaka Sayısı", "Çözülen", "Devam Eden", "Acil"]],
    body: birimler.map((bId) => {
      const birimVakalar = veri.vakalar.filter((v) => v.birimId === bId);
      return [
        getBirim(bId).ad,
        String(birimVakalar.length),
        String(birimVakalar.filter((v) => v.durum === "cozuldu").length),
        String(
          birimVakalar.filter(
            (v) => v.durum === "devam-ediyor" || v.durum === "atandi"
          ).length
        ),
        String(
          birimVakalar.filter(
            (v) => v.oncelik === "kritik" && v.durum !== "cozuldu"
          ).length
        ),
      ];
    }),
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  });

  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 10;

  // --- Vaka listesi (son 20) ---
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. SON VAKA KAYITLARI (Son 20)", margin, y);
  y += 4;
  doc.setDrawColor(59, 130, 246);
  doc.line(margin, y, sayfaGenislik - margin, y);
  y += 4;

  const sonVakalar = [...veri.vakalar]
    .sort(
      (a, b) =>
        new Date(b.olusturmaZamani).getTime() -
        new Date(a.olusturmaZamani).getTime()
    )
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
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // --- Yeni sayfa: Evrak özeti ---
  doc.addPage();
  y = 20;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
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
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // --- Sonuç ve İmza bölümü ---
  // @ts-expect-error
  y = doc.lastAutoTable.finalY + 15;

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5. DEĞERLENDİRME", margin, y);
  y += 4;
  doc.setDrawColor(59, 130, 246);
  doc.line(margin, y, sayfaGenislik - margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
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
    const satirlar = doc.splitTextToSize(satir, icerikGenislik);
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

  // --- Sayfa altlık ---
  const sayfaSayisi = doc.getNumberOfPages();
  for (let i = 1; i <= sayfaSayisi; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
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

  // İndir
  const dosyaAdi = `Kovancilar_Belediyesi_Aylik_Rapor_${veri.ayYil.replace(/\s/g, "_")}.pdf`;
  doc.save(dosyaAdi);
}
