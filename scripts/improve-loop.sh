#!/usr/bin/env bash
# Öz & Saye — SÜREKLİ güvenli geliştirme döngüsü
#
# Ayrı bir terminal penceresinde çalıştırın. Her turda sıfır-bağlamlı bir Claude
# oturumu TEK küçük, güvenli, yüksek değerli iyileştirme yapar; SCRIPT doğrular
# (lint + build) ve yalnızca YEŞİL ise dala commit'ler. PUSH ETMEZ.
#
# Güvenlik modeli:
#   - Yalnızca feature-branch'te çalışır (main'de reddeder).
#   - Çalışma ağacı KİRLİYSE turu atlar (sen/ana oturum düzenlerken çakışmaz).
#   - Değişiklik sonrası lint+build; KIRMIZIysa otomatik geri alır (reset --hard).
#   - Marka/tasarım token/logo'ya, placeholder NAP'e, dataReady'ye DOKUNMAZ;
#     gerçek veri uydurmaz; push/secret/dış servis YOK (prompt + allowedTools ile).
#
#   bash scripts/improve-loop.sh                  # her 15 dk'da bir iyileştirme
#   IMPROVE_INTERVAL=1800 bash scripts/improve-loop.sh
#
# Durdurmak için: Ctrl-C. Commit'ler dalda kalır; istemediğinizi `git revert` ile alın.
set -uo pipefail

cd "$(git rev-parse --show-toplevel)"
INTERVAL="${IMPROVE_INTERVAL:-900}"
DIR="loglar/improve"
mkdir -p "$DIR"

command -v claude >/dev/null 2>&1 || { echo "HATA: 'claude' CLI bulunamadı."; exit 1; }

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "HATA: improve-loop main/master üzerinde çalışmaz. Önce bir feature-branch'e geçin."
  exit 1
fi

echo "🛠️  improve-loop başladı — dal=$BRANCH, aralık=${INTERVAL}s, log=$DIR/"
echo "   lint+build geçerse commit (PUSH YOK). Ctrl-C ile durdurun."

trap 'echo; echo "improve-loop durduruldu."; exit 0' INT TERM

read -r -d "" PROMPT <<'PROMPT_EOF'
Sen "Öz & Saye Psikoloji" (Türkçe, STATİK Next.js 16 output:export sitesi)
deposunda çalışan kıdemli, dikkatli bir geliştiricisin. Bu turda YALNIZCA BİR
adet küçük, güvenli, yüksek değerli iyileştirme yap.

ÖNCE OKU: CLAUDE.md ve AGENTS.md (proje kuralları). Varsa loglar/review/latest.md
(bağımsız review bulguları) — oradaki en yüksek öncelikli, GÜVENLE düzeltilebilir
maddeyi seç. Review raporu yoksa kendi gözlemininle güvenli bir iyileştirme seç
(erişilebilirlik, performans, ölü kod temizliği, kod tutarlılığı/refactor,
içerik dili/yazım, doküman, küçük UX cilası).

KESİN KURALLAR (ihlal etme):
- Marka kimliğini DEĞİŞTİRME: logo/amblem, renk token'ları (globals.css @theme),
  Playfair/Montserrat fontları, palet — talimat olmadan dokunma.
- Placeholder/gerçek veri: site.ts'teki [DOLDUR] NAP/kimlik değerlerini doldurma,
  uydurma; site.dataReady'yi DEĞİŞTİRME. Klinik içeriği uydurma.
- Statik export uyumunu bozma (Server Action/API/cookies yok; form public/randevu.php).
- Tasarım disiplini: metin yalnızca text-forest/text-forest-muted; opaklık-tabanlı
  metin ve metin-olarak text-sage YASAK; forest zeminde text-sage-light.
- İkinci blog route'u açma (kanonik /blog). Kanonik domain ozsaye.com.
- KAPSAM: tek bir küçük değişiklik. Geniş yeniden yazım/çok-dosyalı süpürme YAPMA.
- git commit/push YAPMA, npm build/lint ÇALIŞTIRMA — bunları dış script yapar.
  Yalnızca dosyaları düzenle (Edit/Write).

ÇIKTI: İşin bitince SON SATIR olarak tek satırlık özet yaz:
OZET: <ne değiştirdiğini kısaca, commit mesajı için>
Hiçbir şey yapmaya değer güvenli iyileştirme bulamazsan, dosyaları değiştirme ve
yalnızca şunu yaz: OZET: (iyileştirme yok)
PROMPT_EOF

n=0
while true; do
  n=$((n + 1))
  TS="$(date +%Y%m%d-%H%M%S)"
  LOG="$DIR/improve-$TS.log"
  echo
  echo "── Tur #$n  ($TS) ───────────────────────────"

  if [ -n "$(git status --porcelain)" ]; then
    echo "⏭️  Çalışma ağacı kirli (başka düzenleme sürüyor olabilir). Bu tur atlandı."
    sleep "$INTERVAL"; continue
  fi

  echo "🤖 Claude iyileştirme yapıyor…"
  claude -p "$PROMPT" \
    --output-format text \
    --allowedTools "Read,Grep,Glob,Edit,Write,Bash(git log:*),Bash(git show:*),Bash(ls:*)" \
    > "$LOG" 2>&1 || true
  SUMMARY="$(grep -m1 '^OZET:' "$LOG" | sed 's/^OZET:[[:space:]]*//')"
  [ -z "$SUMMARY" ] && SUMMARY="otomatik iyileştirme"

  if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  Değişiklik yapılmadı. ($SUMMARY)  Log: $LOG"
    sleep "$INTERVAL"; continue
  fi

  echo "🔎 Doğrulanıyor (lint + build)…  Özet: $SUMMARY"
  if npm run lint >>"$LOG" 2>&1 && npm run build >>"$LOG" 2>&1; then
    git add -A
    git commit -q -F - <<COMMIT_EOF
geliştirme(otomatik): $SUMMARY

improve-loop tarafından üretildi; lint + build yeşil. PUSH edilmedi.
Log: $LOG

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
COMMIT_EOF
    echo "✅ Commit'lendi: $SUMMARY"
  else
    echo "❌ lint/build KIRMIZI — değişiklik geri alınıyor. Ayrıntı: $LOG"
    git reset --hard -q HEAD
    git clean -fdq
  fi

  echo "💤 ${INTERVAL}s bekleniyor…"
  sleep "$INTERVAL"
done
