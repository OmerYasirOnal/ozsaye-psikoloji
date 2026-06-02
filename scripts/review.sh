#!/usr/bin/env bash
# Öz & Saye — Sıfır bağlamlı (fresh) kod gözden geçirme
#
# Mevcut dalın bir temel dala (varsayılan: origin/main) göre farkını,
# bağlamı sıfır olan AYRI bir Claude oturumuna inceletir ve markdown rapor
# üretir. Böylece çalışan oturumun kör noktalarını yakalarız.
#
# Kullanım:
#   bash scripts/review.sh                 # origin/main'e göre, rapor: review-rapor.md
#   bash scripts/review.sh origin/main out.md
#
# Sonra: raporu oku, gerçek bulguları düzelt, tekrar çalıştır.
set -euo pipefail

BASE="${1:-origin/main}"
OUT="${2:-review-rapor.md}"
cd "$(git rev-parse --show-toplevel)"

command -v claude >/dev/null 2>&1 || { echo "HATA: 'claude' CLI bulunamadı."; exit 1; }

git fetch -q origin "${BASE#origin/}" 2>/dev/null || true

DIFF_FILE="$(mktemp /tmp/review-diff.XXXXXX.patch)"
trap 'rm -f "$DIFF_FILE"' EXIT
git diff "$BASE"...HEAD > "$DIFF_FILE" 2>/dev/null || git diff "$BASE" > "$DIFF_FILE"
if [ ! -s "$DIFF_FILE" ]; then
  echo "Değişiklik yok ($BASE ile karşılaştırıldı). Rapor üretilmedi."
  exit 0
fi

echo "Gözden geçiriliyor: HEAD vs $BASE  ($(wc -l < "$DIFF_FILE") satır diff)"

OUT_ABS="$(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")"

PROMPT=$(cat <<EOF
Sen kıdemli, titiz ve BAĞIMSIZ bir kod gözden geçiricisin. Bu repodaki
değişiklikleri sıfırdan, önyargısız incele.

ÇIKTI KURALI: Gözden geçirme bittiğinde raporu Write aracıyla SADECE şu dosyaya
yaz: $OUT_ABS . Soru sorma, onay isteme, "git status" önerme, commit önerme;
çalışma dizinindeki untracked/hook uyarılarını TAMAMEN yok say. Bu inceleme
salt-okunurdur; kod DEĞİŞTİRME.

Önce diff'i oku: $DIFF_FILE (Read aracıyla). Gerekirse repodaki ilgili dosyaları
Read/Grep/Glob ile incele.

Şu başlıklara odaklan:
- Doğruluk hataları ve kenar durumları (edge cases)
- Güvenlik / gizli bilgi sızıntısı / XSS (özellikle dangerouslySetInnerHTML, kullanıcı/dış veri)
- Next.js 16 App Router + statik export ('output: export') uyumu
- Türkçe karakter / encoding sorunları
- Ölü kod, kullanılmayan değişken, tutarsız isimlendirme
- Performans ve gereksiz tekrarlar

Çıktıyı YALNIZCA şu markdown formatında ver (Türkçe, kısa ve net):

## Özet
(1-3 cümle genel değerlendirme)

## Bulgular
Her bulgu:
- **[Yüksek|Orta|Düşük]** \`dosya:satır\` — sorun. Öneri: ...
(Bulgu yoksa "Belirgin bulgu yok." yaz.)

## Sonuç
(Merge edilebilir mi? Önce düzeltilmesi gereken Yüksek öncelikli madde var mı?)
EOF
)

claude -p "$PROMPT" \
  --output-format text \
  --allowedTools "Read,Grep,Glob,Write,Bash(git log:*),Bash(git show:*)" \
  > "${OUT}.log" 2>&1 || true

if [ -s "$OUT" ]; then
  echo "Rapor yazıldı: $OUT"
else
  echo "UYARI: Rapor dosyası boş; ham oturum çıktısı: ${OUT}.log"
  exit 2
fi
