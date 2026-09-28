// Kovancılar Belediyesi · Saha Operasyon Merkezi — Merkezi durum yönetimi
// Zustand + persist (localStorage) ile vaka, bildirim, ekip ve araç
// durumunu kalıcı hale getiriyor. Socket.io olayları da buraya yansır.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VAKALAR,
  OPERASYON_OZEL_VAKALAR,
  EKIPLER,
  ARAÇLAR,
  BILDIRIMLER,
  MAHALLELER,
  DENETIM_KAYITLARI,
  SU_ARIZA,
  EVRAKLAR,
} from "./mock-data";
import type {
  Vaka,
  VakaDurum,
  VakaOncelik,
  Ekip,
  Bildirim,
  BirimId,
  DenetimKaydi,
  SuAruzaKaydi,
  Evrak,
} from "./types";

interface OperasyonState {
  // Veri
  vakalar: Vaka[];
  ekipler: Ekip[];
  bildirimler: Bildirim[];
  denetimler: DenetimKaydi[];
  suAriza: SuAruzaKaydi[];
  evraklar: Evrak[];

  // Socket.io broadcast fonksiyonu — frontend tarafından set edilir
  broadcastFn: ((event: {
    type: string;
    payload: {
      vakaId?: string;
      birimId?: string;
      baslik: string;
      icerik: string;
      seviye: "bilgi" | "uyari" | "kritik";
      zaman: string;
      kaynak?: string;
    };
  }) => boolean) | null;
  setBroadcastFn: (fn: OperasyonState["broadcastFn"]) => void;

  // Mutasyonlar — Vaka
  addVaka: (vaka: Vaka) => void;
  updateVaka: (id: string, patch: Partial<Vaka>) => void;
  assignEkipToVaka: (id: string, ekipId: string, personel?: string) => void;
  changeVakaDurum: (id: string, durum: VakaDurum, not?: string) => void;
  closeVaka: (id: string, cozumNotu: string) => void;
  deleteVaka: (id: string) => void;

  // Mutasyonlar — Ekip
  updateEkipDurum: (id: string, durum: Ekip["durum"]) => void;
  addEkip: (ekip: Ekip) => void;
  deleteEkip: (id: string) => void;

  // Mutasyonlar — Mahalle
  mahalleler: typeof MAHALLELER;
  addMahalle: (mahalle: { id: string; ad: string; nufus: number; vakaSayisi: number }) => void;
  deleteMahalle: (id: string) => void;

  // Mutasyonlar — Araç
  araclar: typeof ARAÇLAR;
  addArac: (arac: typeof ARAÇLAR[number]) => void;
  deleteArac: (id: string) => void;

  // Mutasyonlar — Bildirim
  addBildirim: (bildirim: Bildirim) => void;
  markBildirimOkundu: (id: string) => void;
  markAllBildirimOkundu: () => void;

  // Mutasyonlar — Evrak
  addEvrak: (evrak: Evrak) => void;
  updateEvrakDurum: (id: string, durum: Evrak["durum"]) => void;
  deleteEvrak: (id: string) => void;

  // Mutasyonlar — Denetim
  addDenetim: (denetim: DenetimKaydi) => void;
  deleteDenetim: (id: string) => void;

  // Mutasyonlar — Su Arıza
  addSuAriza: (kayit: SuAruzaKaydi) => void;

  // Yardımcılar
  getVakalarByBirim: (birimId: BirimId) => Vaka[];
  getEkilerByBirim: (birimId: BirimId) => Ekip[];
  resetToSeed: () => void;
}

const allVakalar: Vaka[] = [...VAKALAR, ...OPERASYON_OZEL_VAKALAR];

const initialState = {
  vakalar: allVakalar,
  ekipler: EKIPLER,
  bildirimler: BILDIRIMLER,
  denetimler: DENETIM_KAYITLARI,
  suAriza: SU_ARIZA,
  evraklar: EVRAKLAR,
  mahalleler: MAHALLELER,
  araclar: ARAÇLAR,
};

export const useOperasyonStore = create<OperasyonState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Socket.io broadcast fonksiyonu — use-notifications hook tarafından set edilir
      broadcastFn: null,
      setBroadcastFn: (fn) => set({ broadcastFn: fn }),

      // --- Vaka mutasyonları ---

      addVaka: (vaka) => {
        set((s) => ({ vakalar: [vaka, ...s.vakalar] }));
        // Otomatik bildirim
        const bildirim: Bildirim = {
          id: `B-${Date.now()}`,
          baslik: "Yeni vaka oluşturuldu",
          icerik: `${vaka.id} — ${vaka.baslik} (${vaka.mahalle})`,
          seviye: vaka.oncelik === "kritik" ? "kritik" : "uyari",
          zaman: new Date().toISOString(),
          okundu: false,
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
              zaman: bildirim.zaman,
            },
          });
        }
      },

      updateVaka: (id, patch) =>
        set((s) => ({
          vakalar: s.vakalar.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),

      assignEkipToVaka: (id, ekipId, personel) => {
        const ekip = get().ekipler.find((e) => e.id === ekipId);
        set((s) => ({
          vakalar: s.vakalar.map((v) =>
            v.id === id
              ? {
                  ...v,
                  atananEkip: ekipId,
                  atananPersonel: personel ?? ekip?.lider,
                  durum: v.durum === "yeni" ? "atandi" : v.durum,
                }
              : v
          ),
          ekipler: s.ekipler.map((e) =>
            e.id === ekipId ? { ...e, durum: "gorevde" } : e
          ),
        }));
        const vaka = get().vakalar.find((v) => v.id === id);
        const bildirim: Bildirim = {
          id: `B-${Date.now()}`,
          baslik: "Ekip atandı",
          icerik: `${id} → ${ekip?.ad ?? ekipId} (${ekip?.lider ?? ""})`,
          seviye: "bilgi",
          zaman: new Date().toISOString(),
          okundu: false,
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
              zaman: bildirim.zaman,
            },
          });
        }
      },

      changeVakaDurum: (id, durum, not) => {
        set((s) => ({
          vakalar: s.vakalar.map((v) =>
            v.id === id
              ? {
                  ...v,
                  durum,
                  aciklama: not ? `${v.aciklama}\n\n[Güncelleme]: ${not}` : v.aciklama,
                }
              : v
          ),
        }));
        const vaka = get().vakalar.find((v) => v.id === id);
        const bildirim: Bildirim = {
          id: `B-${Date.now()}`,
          baslik: `Vaka durumu: ${durum.toUpperCase()}`,
          icerik: `${id} vakası "${durum}" durumuna güncellendi.`,
          seviye: "bilgi",
          zaman: new Date().toISOString(),
          okundu: false,
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
              zaman: bildirim.zaman,
            },
          });
        }
      },

      closeVaka: (id, cozumNotu) => {
        set((s) => ({
          vakalar: s.vakalar.map((v) =>
            v.id === id
              ? {
                  ...v,
                  durum: "cozuldu",
                  aciklama: `${v.aciklama}\n\n[Çözüm notu]: ${cozumNotu}`,
                }
              : v
          ),
        }));
        // Ekip müsait hale gelsin
        const vaka = get().vakalar.find((v) => v.id === id);
        if (vaka?.atananEkip) {
          set((s) => ({
            ekipler: s.ekipler.map((e) =>
              e.id === vaka.atananEkip ? { ...e, durum: "musait" } : e
            ),
          }));
        }
        const bildirim: Bildirim = {
          id: `B-${Date.now()}`,
          baslik: "Vaka kapatıldı ✓",
          icerik: `${id} — çözüldü. Not: ${cozumNotu.slice(0, 100)}${cozumNotu.length > 100 ? "..." : ""}`,
          seviye: "bilgi",
          zaman: new Date().toISOString(),
          okundu: false,
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
              zaman: bildirim.zaman,
            },
          });
        }
      },

      // Vaka silme — kalıcı olarak kaldırır (geri alınamaz)
      deleteVaka: (id) => {
        // Önce silinecek vakayı bul (hala store'da varken)
        const vaka = get().vakalar.find((v) => v.id === id);
        set((s) => ({
          vakalar: s.vakalar.filter((v) => v.id !== id),
        }));
        // İlgili ekip müsait hale gelsin
        if (vaka?.atananEkip) {
          set((s) => ({
            ekipler: s.ekipler.map((e) =>
              e.id === vaka.atananEkip ? { ...e, durum: "musait" } : e
            ),
          }));
        }
        get().addBildirim({
          id: `B-${Date.now()}`,
          baslik: "Vaka silindi",
          icerik: `${id} kaydı sistemden kalıcı olarak kaldırıldı.`,
          seviye: "uyari",
          zaman: new Date().toISOString(),
          okundu: false,
        });
      },

      // --- Ekip mutasyonları ---

      updateEkipDurum: (id, durum) =>
        set((s) => ({
          ekipler: s.ekipler.map((e) =>
            e.id === id ? { ...e, durum } : e
          ),
        })),

      addEkip: (ekip) =>
        set((s) => ({ ekipler: [ekip, ...s.ekipler] })),

      deleteEkip: (id) =>
        set((s) => ({
          ekipler: s.ekipler.filter((e) => e.id !== id),
        })),

      // --- Mahalle mutasyonları ---

      addMahalle: (mahalle) =>
        set((s) => ({ mahalleler: [...s.mahalleler, mahalle] })),

      deleteMahalle: (id) =>
        set((s) => ({
          mahalleler: s.mahalleler.filter((m) => m.id !== id),
        })),

      // --- Araç mutasyonları ---

      addArac: (arac) =>
        set((s) => ({ araclar: [arac, ...s.araclar] })),

      deleteArac: (id) =>
        set((s) => ({
          araclar: s.araclar.filter((a) => a.id !== id),
        })),

      // --- Bildirim mutasyonları ---

      addBildirim: (bildirim) =>
        set((s) => ({
          bildirimler: [bildirim, ...s.bildirimler].slice(0, 50),
        })),

      markBildirimOkundu: (id) =>
        set((s) => ({
          bildirimler: s.bildirimler.map((b) =>
            b.id === id ? { ...b, okundu: true } : b
          ),
        })),

      markAllBildirimOkundu: () =>
        set((s) => ({
          bildirimler: s.bildirimler.map((b) => ({ ...b, okundu: true })),
        })),

      // --- Evrak mutasyonları ---

      addEvrak: (evrak) =>
        set((s) => ({ evraklar: [evrak, ...s.evraklar] })),

      updateEvrakDurum: (id, durum) =>
        set((s) => ({
          evraklar: s.evraklar.map((e) =>
            e.id === id ? { ...e, durum } : e
          ),
        })),

      deleteEvrak: (id) =>
        set((s) => ({
          evraklar: s.evraklar.filter((e) => e.id !== id),
        })),

      // --- Denetim mutasyonları ---

      addDenetim: (denetim) =>
        set((s) => ({ denetimler: [denetim, ...s.denetimler] })),

      deleteDenetim: (id) =>
        set((s) => ({
          denetimler: s.denetimler.filter((d) => d.id !== id),
        })),

      // --- Su Arıza mutasyonları ---

      addSuAriza: (kayit) =>
        set((s) => ({ suAriza: [kayit, ...s.suAriza] })),

      // --- Yardımcılar ---

      getVakalarByBirim: (birimId) => {
        const all = get().vakalar;
        if (birimId === "operasyon") return all;
        return all.filter((v) => v.birimId === birimId);
      },

      getEkilerByBirim: (birimId) => {
        const all = get().ekipler;
        if (birimId === "operasyon") return all;
        return all.filter((e) => e.birimId === birimId);
      },

      resetToSeed: () => set({ ...initialState }),
    }),
    {
      name: "kovancilar-bsm-store",
      // Sadece veriyi persist et (fonksiyonları değil)
      partialize: (s) => ({
        vakalar: s.vakalar,
        ekipler: s.ekipler,
        bildirimler: s.bildirimler,
        denetimler: s.denetimler,
        suAriza: s.suAriza,
        evraklar: s.evraklar,
        mahalleler: s.mahalleler,
        araclar: s.araclar,
      }),
      version: 4,
    }
  )
);

// --- Statik yardımcılar (Persist sonrası store'da kalıcı değil) ---

export { MAHALLELER, ARAÇLAR };

// Persist edilen store'da vakalar için ID üreten yardımcı
export function generateVakaId(): string {
  return `V-2026-${Math.floor(1000 + Math.random() * 8999)}`;
}

export function generateBildirimId(): string {
  return `B-${Date.now()}`;
}

export type { Vaka, VakaDurum, VakaOncelik, Ekip, Bildirim, Evrak };
