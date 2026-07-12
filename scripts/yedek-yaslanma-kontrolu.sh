#!/usr/bin/env bash
#
# yedek-yaslanma-kontrolu.sh — Öz & Saye: haftalık Neon yedeği gecikirse uyar.
# ---------------------------------------------------------------------------
# Neden: neon-yedek.sh'nin kendi hata mesajı yalnız İŞ ÇALIŞTIĞINDA ve
# BAŞARISIZ OLDUĞUNDA devreye girer. Mac o Cumartesi 04:00'te kapalıysa
# launchd job'u hiç TETİKLENMEZ — bu durumda hata da yoktur, sessizce hiçbir
# yedek alınmamış olur. Bu script bağımsız çalışır: en yeni yedeğin YAŞINA
# bakar, eşik aşılırsa Telegram'a haber verir. Günlük çalıştırılması önerilir
# (bkz. launchd/com.ozsaye.yedek-yaslanma-kontrolu.plist) — koşul düzelene
# kadar günde bir hatırlatma gelir (spam değil, kabul edilebilir sıklık).
#
# Kullanım:
#   bash scripts/yedek-yaslanma-kontrolu.sh
#   OZSAYE_REPO=/mutlak/repo bash scripts/yedek-yaslanma-kontrolu.sh
# ---------------------------------------------------------------------------
set -euo pipefail
PATH="/usr/local/bin:/opt/homebrew/bin:${PATH}"

readonly BACKUP_DIR="${HOME}/Yedekler/ozsaye"
readonly ESIK_GUN=9   # haftalık yedek + 2 gün tolerans

repo_root() {
  if [[ -n "${OZSAYE_REPO:-}" ]]; then printf '%s\n' "$OZSAYE_REPO"; return; fi
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  dirname "$script_dir"
}

# tools/icerik-uretici/.env.local'den bir anahtarın değerini güvenle oku (yok/boş → "").
env_degeri_oku() {
  local dosya="$1" anahtar="$2" satir
  [[ -f "$dosya" ]] || { printf ''; return; }
  satir="$(grep -E "^[[:space:]]*${anahtar}=" "$dosya" | head -n1 || true)"
  [[ -n "$satir" ]] || { printf ''; return; }
  satir="${satir#*${anahtar}=}"
  satir="${satir%$'\r'}"
  printf '%s' "$satir"
}

telegrama_gonder() {
  local mesaj="$1" repo env_file token chat_id
  repo="$(repo_root)"
  env_file="${repo%/}/tools/icerik-uretici/.env.local"
  token="$(env_degeri_oku "$env_file" TG_BOT_TOKEN)"
  chat_id="$(env_degeri_oku "$env_file" TG_CHAT_ID)"
  if [[ -z "$token" || -z "$chat_id" ]]; then
    echo "UYARI: TG_BOT_TOKEN/TG_CHAT_ID bulunamadı, Telegram atlandı." >&2
    return 0
  fi
  curl -s -m 10 "https://api.telegram.org/bot${token}/sendMessage" \
    --data-urlencode "chat_id=${chat_id}" \
    --data-urlencode "text=${mesaj}" >/dev/null || echo "UYARI: Telegram gönderilemedi." >&2
}

main() {
  shopt -s nullglob
  local dumps=( "${BACKUP_DIR}"/ozsaye-*.dump )
  shopt -u nullglob

  if (( ${#dumps[@]} == 0 )); then
    echo "$(date '+%Y-%m-%d %H:%M') | HİÇ YEDEK YOK"
    telegrama_gonder "⚠️ ozsaye: hiç Neon yedeği bulunamadı (${BACKUP_DIR}). neon-yedek.sh hiç çalışmamış olabilir."
    return
  fi

  local en_yeni
  en_yeni="$(ls -t "${dumps[@]}" | head -n1)"
  local mtime yas_saniye yas_gun
  mtime="$(stat -f %m "$en_yeni")"
  yas_saniye=$(( $(date +%s) - mtime ))
  yas_gun=$(( yas_saniye / 86400 ))

  if (( yas_gun > ESIK_GUN )); then
    echo "$(date '+%Y-%m-%d %H:%M') | ESKİ: $(basename "$en_yeni") (${yas_gun} gün)"
    telegrama_gonder "⚠️ ozsaye: en güncel Neon yedeği ${yas_gun} gün önce alınmış ($(basename "$en_yeni")). Mac'in Cumartesi 04:00'te açık olduğundan emin ol."
  else
    echo "$(date '+%Y-%m-%d %H:%M') | tamam: $(basename "$en_yeni") (${yas_gun} gün)"
  fi
}

main "$@"
