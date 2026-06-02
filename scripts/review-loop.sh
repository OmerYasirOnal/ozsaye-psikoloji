#!/usr/bin/env bash
# Öz & Saye — SÜREKLİ bağımsız review döngüsü (salt-okunur)
#
# Ayrı bir terminal penceresinde çalıştırın. Her turda sıfır-bağlamlı bir
# Claude oturumu mevcut dalın main'e göre farkını inceler ve zaman damgalı bir
# rapor üretir. KOD DEĞİŞTİRMEZ — yalnızca rapor yazar.
#
#   bash scripts/review-loop.sh                 # her 20 dk'da bir review
#   REVIEW_INTERVAL=600 bash scripts/review-loop.sh   # her 10 dk
#   REVIEW_BASE=origin/main bash scripts/review-loop.sh
#
# Durdurmak için: Ctrl-C (veya pencereyi kapatın).
set -uo pipefail

cd "$(git rev-parse --show-toplevel)"
INTERVAL="${REVIEW_INTERVAL:-1200}"
BASE="${REVIEW_BASE:-origin/main}"
DIR="loglar/review"
mkdir -p "$DIR"

command -v claude >/dev/null 2>&1 || { echo "HATA: 'claude' CLI bulunamadı."; exit 1; }

echo "🔍 review-loop başladı — base=$BASE, aralık=${INTERVAL}s, çıktı=$DIR/"
echo "   (Ctrl-C ile durdurun)"

trap 'echo; echo "review-loop durduruldu."; exit 0' INT TERM

n=0
while true; do
  n=$((n + 1))
  TS="$(date +%Y%m%d-%H%M%S)"
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  OUT="$DIR/review-$TS.md"
  echo
  echo "── Tur #$n  ($TS, dal: $BRANCH) ───────────────────────────"
  git fetch -q origin "${BASE#origin/}" 2>/dev/null || true

  if git diff --quiet "$BASE"...HEAD 2>/dev/null; then
    echo "Değişiklik yok ($BASE ile aynı). Bu tur atlandı."
  else
    bash scripts/review.sh "$BASE" "$OUT" || echo "(review.sh bu turda rapor üretemedi)"
    if [ -s "$OUT" ]; then
      cp -f "$OUT" "$DIR/latest.md"
      echo "✓ Rapor: $OUT  (kopya: $DIR/latest.md)"
      # Yüksek/Orta bulgu sayısını özetle
      H=$(grep -ciE '\*\*\[?Yüksek' "$OUT" 2>/dev/null || echo 0)
      O=$(grep -ciE '\*\*\[?Orta' "$OUT" 2>/dev/null || echo 0)
      echo "   Yüksek: $H  Orta: $O"
    fi
  fi

  echo "💤 ${INTERVAL}s bekleniyor… (sonraki tur #$((n + 1)))"
  sleep "$INTERVAL"
done
