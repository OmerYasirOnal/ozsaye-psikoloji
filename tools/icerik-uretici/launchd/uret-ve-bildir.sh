#!/usr/bin/env bash
# Öz & Saye — günlük üretim + Telegram bildirimi (launchd com.ozsaye.icerik-uret tetikler).
#
# İki adımı sırayla koşar:  index.cjs (üret) → telegram-bot.cjs notify --hepsi (bildir).
# launchd'nin PATH'i DARDIR ('/usr/bin:/bin' civarı) → Homebrew'u ekleriz ki 'node'
# ve 'ffmpeg' bulunsun. Repo kökü, bu script'in konumundan türetilir (checkout taşınsa
# da çalışır). Argümanlar index.cjs'e geçer (ör. '--no-llm').
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH:-}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"   # …/tools/icerik-uretici/launchd
TOOL_DIR="$(cd "$HERE/.." && pwd)"                     # …/tools/icerik-uretici
REPO="$(cd "$TOOL_DIR/../.." && pwd)"                  # repo kökü
cd "$REPO"

NODE="$(command -v node)"
echo "[$(date '+%F %T')] üretim başlıyor (repo: $REPO, node: $NODE)"
"$NODE" "$TOOL_DIR/index.cjs" "$@"                        # yayınlı yazılardan taslak üret
"$NODE" "$TOOL_DIR/telegram-bot.cjs" notify --hepsi       # yeni taslakları Telegram'a bildir
echo "[$(date '+%F %T')] tamam"
