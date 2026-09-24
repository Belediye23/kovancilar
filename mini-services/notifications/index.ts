// Kovancılar Belediyesi · Saha Operasyon Merkezi
// Canlı bildirim Socket.io mini-service — port 3004
//
// Bu servis, tüm birim panelleri arasında canlı bildirim yayını yapar.
// Frontend io("/?XTransformPort=3004") ile bağlanır.

import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  // Path "/" — Caddy bu portu path'i kullanarak forward eder
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --- Tip tanımları ---

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
    kaynak?: string; // hangi sicil/personel
  };
}

// Bağlı oturumlar — birim bazında ayrı kanallar
const connectedClients = new Map<string, { sicil: string; birimId: string }>();

// Hoş geldin mesajı — bağlanan her cliente yollanır
function makeWelcomeMessage(): string {
  return `Kovancılar Belediyesi Saha Operasyon Merkezi canlı bildirim servisine bağlandınız. ${new Date().toLocaleString("tr-TR")}`;
}

io.on("connection", (socket) => {
  console.log(`[socket] Yeni bağlantı: ${socket.id}`);

  // Client kimlik bilgisi gönderir: { sicil, birimId }
  socket.on("register", (data: { sicil: string; birimId: string }) => {
    if (!data?.sicil || !data?.birimId) {
      console.warn(`[socket] Geçersiz register: ${JSON.stringify(data)}`);
      return;
    }
    connectedClients.set(socket.id, {
      sicil: data.sicil,
      birimId: data.birimId,
    });

    // Operasyon Merkezi tüm birimlerin olaylarını dinler
    // Diğer birimler yalnızca kendi olaylarını alır
    if (data.birimId === "operasyon") {
      // Tüm olaylar
      socket.join("operasyon");
      socket.join("broadcast");
    } else {
      socket.join(`birim:${data.birimId}`);
      socket.join("broadcast");
    }

    socket.emit("welcome", {
      mesaj: makeWelcomeMessage(),
      sicil: data.sicil,
      birimId: data.birimId,
      zaman: new Date().toISOString(),
      bagliClientSayisi: connectedClients.size,
    });

    console.log(
      `[socket] ${data.sicil} (${data.birimId}) kayıt oldu — toplam ${connectedClients.size} client`
    );
  });

  // Client bir vaka olayı yayınlar (broadcast isteği)
  socket.on("broadcast:event", (event: BroadcastEvent) => {
    console.log(
      `[socket] Broadcast (${event.type}): ${event.payload?.baslik ?? "?"}`
    );

    const payload = {
      ...event,
      payload: {
        ...event.payload,
        zaman: event.payload.zaman || new Date().toISOString(),
      },
    };

    // Hedef birim varsa yalnızca o birime (ve operasyona) gönder
    if (event.payload?.birimId) {
      // Hedef birime
      io.to(`birim:${event.payload.birimId}`).emit("notification:new", payload);
      // Operasyon Merkezi her şeyi görür
      io.to("operasyon").emit("notification:new", payload);
    } else {
      // Genel broadcast — herkese
      io.emit("notification:new", payload);
    }
  });

  // Ping — canlılık kontrolü
  socket.on("ping", () => {
    socket.emit("pong", { zaman: new Date().toISOString() });
  });

  socket.on("disconnect", () => {
    const client = connectedClients.get(socket.id);
    if (client) {
      console.log(
        `[socket] ${client.sicil} (${client.birimId}) ayrıldı`
      );
      connectedClients.delete(socket.id);
    } else {
      console.log(`[socket] Anonim bağlantı kapandı: ${socket.id}`);
    }
  });

  socket.on("error", (error) => {
    console.error(`[socket] Hata (${socket.id}):`, error);
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(
    `[notifications] Socket.io servisi ${PORT} portunda çalışıyor`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[notifications] SIGTERM alındı, kapatılıyor...");
  httpServer.close(() => {
    io.close();
    console.log("[notifications] Sunucu kapatıldı");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[notifications] SIGINT alındı, kapatılıyor...");
  httpServer.close(() => {
    io.close();
    process.exit(0);
  });
});
