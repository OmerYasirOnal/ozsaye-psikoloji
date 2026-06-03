#!/usr/bin/env bash
# Öz & Saye Psikoloji — marka fontlarını kurar (görsel üretici script'ler için).
# Türkçe karakter kapsamı tam olan variable TTF'leri indirir:
#   Playfair Display (+ Italic) — başlık/serif (Google Fonts, OFL)
#   Montserrat — gövde/sans (Google Fonts, OFL)
# Kullanım: bash scripts/setup-fonts.sh
#   Yerel (sudo'suz) için: BRAND_FONT_DIR=./.fonts bash scripts/setup-fonts.sh
#   brand.cjs aynı BRAND_FONT_DIR'i okur.
set -euo pipefail

DEST="${BRAND_FONT_DIR:-${FONT_DEST:-/usr/share/fonts/brand}}"
mkdir -p "$DEST"

GF="https://github.com/google/fonts/raw/main/ofl"
echo "indiriliyor: PlayfairDisplay.ttf"
curl -sL -m 60 "$GF/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" -o "$DEST/PlayfairDisplay.ttf"
echo "indiriliyor: PlayfairDisplay-Italic.ttf"
curl -sL -m 60 "$GF/playfairdisplay/PlayfairDisplay-Italic%5Bwght%5D.ttf" -o "$DEST/PlayfairDisplay-Italic.ttf"
echo "indiriliyor: Montserrat.ttf"
curl -sL -m 60 "$GF/montserrat/Montserrat%5Bwght%5D.ttf" -o "$DEST/Montserrat.ttf"

fc-cache -f >/dev/null 2>&1 || true
echo "Tamam. Kurulu marka fontları ($DEST):"
ls -1 "$DEST" | grep -iE "playfair|montserrat" || true
