"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useOperasyonStore } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import type { SessionUser, Bildirim } from "@/lib/types";

// Socket.io canlı bildirim servisi
//
// Vercel/serverless'da Socket.io çalışmaz. Bu yüzden:
// 1. NEXT_PUBLIC_SOCKET_URL tanımlıysa → ona bağlan (Render/Railway/Fly.io)
// 2. Tanımlı değilse → XTransformPort=3004 ile yerel Caddy gateway dene
// 3. Hiçbiri çalışmazsa → otomatik OFFLINE moduna düşer, uygulama lokal çalışır

const SOCKET_URL_FROM_ENV = process.env.NEXT_PUBLIC_SOCKET_URL || "";

// Yerel sandbox'ta Caddy XTransformPort forwarding'i kullanır
// Vercel/production'da env'ten gelen URL kullanılır
function buildSocketUrl(): string {
  if (SOCKET_URL_FROM_ENV && SOCKET_URL_FROM_ENV.length > 0) {
    return SOCKET_URL_FROM_ENV;
  }
  // Sandbox/local — Caddy gateway XTransformPort kullanır
  const SOCKET_PORT = 3004;
  return `/?XTransformPort=${SOCKET_PORT}`;
}

const SOCKET_URL = buildSocketUrl();

interface BroadcastEvent {
  type:
    | "vaka:create"
    | "vaka:update"
    | "vaka:assign"
    | "vaka:close"
    | "vaka:durum"
    | "bildirim:new"
    | "ekip:update";
  payload: {
    vakaId?: string;
    birimId?: string;
    baslik: string;
    icerik: string;
    seviye: "bilgi" | "uyari" | "kritik";
    zaman: string;
    kaynak?: string;
  };
}

interface WelcomeMessage {
  mesaj: string;
  sicil: string;
  birimId: string;
  zaman: string;
  bagliClientSayisi: number;
}

// Tek bir socket instance'ı paylaş — tüm hook çağrılarında aynı socket
let sharedSocket: Socket | null = null;
let sharedRefCount = 0;
let registeredUser: { sicil: string; birimId: string } | null = null;

export function useNotifications(user: SessionUser | null) {
  const [connected, setConnected] = useState(false);
  const [welcome, setWelcome] = useState<WelcomeMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const addBildirim = useOperasyonStore((s) => s.addBildirim);
  const markBildirimOkundu = useOperasyonStore((s) => s.markBildirimOkundu);
  const markAllBildirimOkundu = useOperasyonStore((s) => s.markAllBildirimOkundu);

  // WebSocket bağlantısını kur
  useEffect(() => {
    if (!user) return;

    sharedRefCount += 1;
    registeredUser = { sicil: user.sicil, birimId: user.birimId };

    if (!sharedSocket) {
      try {
        sharedSocket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5, // Vercel'de Socket.io yoksa hızlı vazgeç
          reconnectionDelay: 3000,
          timeout: 5000,
          // Bağlantı başarısız olursa sessizce offline modda kal
          autoConnect: true,
          forceNew: false,
        });
      } catch (e) {
        // Vercel/serverless'ta Socket.io yok — sessizce offline modda çalış
        console.warn("[ws] Socket.io bağlantısı kurulamadı, offline modda çalışılıyor.");
        return;
      }
    }
    const socket = sharedSocket;
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      // Kimlik bilgisi gönder
      socket.emit("register", {
        sicil: user.sicil,
        birimId: user.birimId,
      });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onWelcome = (data: WelcomeMessage) => {
      setWelcome(data);
    };

    const onNotification = (event: BroadcastEvent) => {
      // Yeni bildirimi store'a ekle
      const yeniBildirim: Bildirim = {
        id: `B-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        baslik: event.payload.baslik,
        icerik: event.payload.icerik,
        seviye: event.payload.seviye,
        zaman: event.payload.zaman,
        okundu: false,
      };
      addBildirim(yeniBildirim);

      // Toast ile anlık göster
      toast({
        title: event.payload.baslik,
        description: event.payload.icerik,
        variant:
          event.payload.seviye === "kritik" ? "destructive" : "default",
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

    return () => {
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
  }, [user, addBildirim]);

  // Server'a broadcast yollama fonksiyonu
  function broadcast(event: Omit<BroadcastEvent, "payload"> & {
    payload: Partial<BroadcastEvent["payload"]> & { baslik: string; icerik: string };
  }) {
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
        ...event.payload,
      },
    });
    return true;
  }

  return {
    connected,
    welcome,
    bagliClientSayisi: welcome?.bagliClientSayisi ?? 0,
    broadcast,
    markBildirimOkundu,
    markAllBildirimOkundu,
  };
}
