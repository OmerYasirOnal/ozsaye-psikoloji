#!/usr/bin/env bash
# Öz & Saye Psikoloji — marka fontlarını kurar (görsel üretici script'ler için).
# Türkçe karakter kapsamı tam olan komple TTF'leri indirir:
#   Cormorant Garamond (Bold/SemiBold/MediumItalic) — CatharsisFonts/Cormorant (OFL)
#   Nunito (variable) — google/fonts (OFL)
# Kullanım: bash scripts/setup-fonts.sh
set -euo pipefail

DEST="${FONT_DEST:-/usr/share/fonts/brand}"
mkdir -p "$DEST"

CORM="https://github.com/CatharsisFonts/Cormorant/raw/master/fonts/ttf"
for f in CormorantGaramond-Bold.ttf CormorantGaramond-SemiBold.ttf CormorantGaramond-MediumItalic.ttf; do
  echo "indiriliyor: $f"
  curl -sL -m 60 "$CORM/$f" -o "$DEST/$f"
done

echo "indiriliyor: Nunito.ttf"
curl -sL -m 60 "https://github.com/google/fonts/raw/main/ofl/nunito/Nunito%5Bwght%5D.ttf" -o "$DEST/Nunito.ttf"

fc-cache -f >/dev/null 2>&1 || true
echo "Tamam. Kurulu marka fontları:"
fc-list | grep -iE "cormorant|nunito" || true
