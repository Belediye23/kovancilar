#!/usr/bin/env bash
# /home/z/my-project/scripts/sync-logo.sh
# Upload dizinine gelen logoyu public'e taşır.
# 5 sn'de bir kontrol yapar; dosya bulunursa kopyalar.

SRC="/home/z/my-project/upload"
DST="/home/z/my-project/public"
TARGET="${DST}/belediye-logo.png"

MAX_ITER=120
ITER=0

echo "[logo-sync] Başlatılıyor..."

while [ $ITER -lt $MAX_ITER ]; do
  for f in "${SRC}"/kovancilar*.png "${SRC}"/belediye-logo*.png "${SRC}"/logo*.png; do
    if [ -f "$f" ]; then
      cp "$f" "$TARGET"
      echo "[logo-sync] Logo kopyalandı: $f → $TARGET"
      ls -la "$TARGET"
      exit 0
    fi
  done

  for f in "${SRC}"/kovancilar*.svg "${SRC}"/kovancilar*.jpg "${SRC}"/belediye-logo.svg; do
    if [ -f "$f" ]; then
      ext="${f##*.}"
      cp "$f" "${DST}/belediye-logo.${ext}"
      echo "[logo-sync] Logo kopyalandı: $f → ${DST}/belediye-logo.${ext}"
      ls -la "${DST}/belediye-logo.${ext}"
      exit 0
    fi
  done

  sleep 5
  ITER=$((ITER + 1))
done

echo "[logo-sync] Zaman aşımı — logo bulunamadı. Varsayılan K rozeti kullanılacak."
exit 1
