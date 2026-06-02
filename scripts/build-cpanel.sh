#!/usr/bin/env bash
# GoDaddy cPanel (Node.js App / Passenger) için kendine yeterli deploy paketi üretir.
# Kullanım: bash scripts/build-cpanel.sh
# Çıktı: ozsaye-cpanel.zip  (cPanel Node app köküne yükleyip açın; startup = server.js)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "1/4 Production build (standalone)..."
npm run build

echo "2/4 Standalone çıktısı toplanıyor..."
rm -rf deploy ozsaye-cpanel.zip
mkdir -p deploy
cp -a .next/standalone/. deploy/
# Next.js standalone, public/ ve .next/static'i otomatik kopyalamaz — elle ekleyelim.
mkdir -p deploy/.next
cp -a .next/static deploy/.next/static
if [ -d public ]; then cp -a public deploy/public; fi

echo "3/4 Zip oluşturuluyor..."
( cd deploy && zip -rq ../ozsaye-cpanel.zip . )

echo "4/4 Hazır: ozsaye-cpanel.zip"
echo "   -> cPanel 'Setup Node.js App' uygulama köküne yükleyin, açın; startup dosyası: server.js"
