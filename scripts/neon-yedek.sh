#!/usr/bin/env bash
#
# neon-yedek.sh — Öz & Saye: Neon Postgres HAFTALIK yerel yedek
# ---------------------------------------------------------------------------
# Neden: Neon free-tier point-in-time-restore penceresi yalnızca ~6 saat.
# KVKK'lı randevu verisi (appointment_requests) için haftalık, cihaz-yerel,
# şifreli-disk (FileVault) altında saklanan bağımsız bir yedek şart.
#
# Ne yapar:
#   1. Prod bağlantısını (DATABASE_URL) repo'daki .env.neon-prod.local'dan
#      GÜVENLE okur (dosyayı source ETMEZ, URL'i asla ekrana/log'a basmaz).
#   2. Docker `postgres:17-alpine` imajıyla `pg_dump -Fc` (custom format) alır.
#      Yerel pg_dump gerektirmez; sürüm >= sunucu (PG17) garanti.
#      URL host komut-satırında GÖRÜNMEZ (`-e PGURL` isim-geçişi) → `ps` sızmaz.
#   3. Bütünlük doğrular: boyut > 1 KB + aynı imajla `pg_restore --list`.
#   4. En yeni 8 yedeği tutar (rotasyon), gerisini siler.
#   5. Tek satır özet basar (tarih, dosya, boyut, kalan) — PII/URL YOK.
#
# Kullanım:
#   bash scripts/neon-yedek.sh                 # yedek al
#   OZSAYE_REPO=/mutlak/repo bash scripts/neon-yedek.sh   # env dosyasını başka repodan çöz
#   bash scripts/neon-yedek.sh --geri-yukle-nasil         # örnek pg_restore komutu
#   bash scripts/neon-yedek.sh --help
#
# Yedek konumu: ~/Yedekler/ozsaye/ (klasör chmod 700; disk FileVault ile şifreli)
#
# ---------------------------------------------------------------------------
# launchd KURULUMU (haftalık otomatik — Cumartesi 04:00):
#   mkdir -p /Users/omeryasironal/Projects/özsaye_psikoloji/loglar
#   cp scripts/launchd/com.ozsaye.neon-yedek.plist ~/Library/LaunchAgents/
#   launchctl load  ~/Library/LaunchAgents/com.ozsaye.neon-yedek.plist
#   launchctl list | grep com.ozsaye.neon-yedek        # yüklendi mi?
#   # Kaldırma:
#   launchctl unload ~/Library/LaunchAgents/com.ozsaye.neon-yedek.plist
#   # Elle bir kez tetikleme (test):
#   launchctl start com.ozsaye.neon-yedek
# NOT: launchd tetiklendiğinde Docker Desktop AÇIK olmalı (arka planda daemon).
#      Docker Desktop'ı "girişte başlat" olarak ayarlamak önerilir.
# ---------------------------------------------------------------------------

set -euo pipefail

# launchd altında PATH minimaldir; docker CLI /usr/local/bin'de.
PATH="/usr/local/bin:/opt/homebrew/bin:${PATH}"

readonly IMAGE="postgres:17-alpine"
readonly BACKUP_DIR="${HOME}/Yedekler/ozsaye"
readonly KEEP=8

# --- yardımcılar -----------------------------------------------------------

die() {
  echo "HATA: $*" >&2
  exit 1
}

repo_root() {
  # OZSAYE_REPO verilmişse onu; yoksa bu script'in bulunduğu repo kökünü kullan.
  if [[ -n "${OZSAYE_REPO:-}" ]]; then
    printf '%s\n' "$OZSAYE_REPO"
    return
  fi
  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  # scripts/ -> repo kökü
  dirname "$script_dir"
}

# DATABASE_URL'i env dosyasından güvenle ayrıştır (source YOK, echo YOK).
read_database_url() {
  local env_file="$1"
  [[ -f "$env_file" ]] || die "env dosyası yok: $env_file (OZSAYE_REPO doğru mu?)"
  local line
  line="$(grep -E '^[[:space:]]*(export[[:space:]]+)?DATABASE_URL=' "$env_file" | head -n1 || true)"
  [[ -n "$line" ]] || die "DATABASE_URL satırı bulunamadı: $env_file"
  # "export " ön ekini ve anahtar+eşittir kısmını at
  line="${line#*DATABASE_URL=}"
  # olası çevreleyen tırnakları soy
  line="${line%\"}"; line="${line#\"}"
  line="${line%\'}"; line="${line#\'}"
  [[ -n "$line" ]] || die "DATABASE_URL boş"
  printf '%s' "$line"
}

# Tek dump denemesi. URL'i -e PGURL (isim-geçişi) ile verir → host ps'te sızmaz.
# $1 = bağlantı url'i, $2 = çıktı dosyası
run_dump() {
  local url="$1" out="$2"
  PGURL="$url" docker run --rm -e PGURL "$IMAGE" \
    sh -c 'pg_dump "$PGURL" -Fc' > "$out"
}

usage() {
  cat <<'EOF'
Öz & Saye — Neon haftalık yedek

  bash scripts/neon-yedek.sh                 Yedek al (~/Yedekler/ozsaye/)
  bash scripts/neon-yedek.sh --geri-yukle-nasil   Örnek geri-yükleme komutu
  bash scripts/neon-yedek.sh --help          Bu yardım

Ortam:
  OZSAYE_REPO   .env.neon-prod.local'in bulunduğu repo kökü (ops.; yoksa
                script'in kendi repo kökü kullanılır).
EOF
}

restore_help() {
  cat <<'EOF'
# Geri yükleme (örnek) — DİKKAT: hedef veritabanının içeriğini değiştirir.
# URL'i ekrana basmadan env dosyasından oku ve dışa aktar, sonra pg_restore çalıştır:

  export PGURL="$(grep -E '^DATABASE_URL=' \
      /Users/omeryasironal/Projects/özsaye_psikoloji/.env.neon-prod.local \
      | sed -E 's/^DATABASE_URL=//; s/^"//; s/"$//')"

  # (a) Tabloları temizleyip aynı DB'ye geri yükle (mevcut şemayı korur):
  docker run --rm -i -e PGURL \
    -v "$HOME/Yedekler/ozsaye:/yedek:ro" \
    postgres:17-alpine \
    sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges \
           -d "$PGURL" /yedek/ozsaye-YYYY-AA-GG-SSDD.dump'

  unset PGURL

# İçeriği önce görmek için (yazmadan) arşivi listele:
  docker run --rm -v "$HOME/Yedekler/ozsaye:/yedek:ro" \
    postgres:17-alpine pg_restore --list /yedek/ozsaye-YYYY-AA-GG-SSDD.dump
EOF
}

# --- ana akış --------------------------------------------------------------

main() {
  case "${1:-}" in
    --help|-h) usage; exit 0 ;;
    --geri-yukle-nasil) restore_help; exit 0 ;;
    "") : ;;
    *) die "bilinmeyen argüman: $1 (--help)" ;;
  esac

  command -v docker >/dev/null 2>&1 || die "docker bulunamadı (PATH / Docker Desktop?)"
  docker info >/dev/null 2>&1 || die "docker daemon çalışmıyor (Docker Desktop açık mı?)"

  local repo env_file database_url
  repo="$(repo_root)"
  env_file="${repo%/}/.env.neon-prod.local"
  database_url="$(read_database_url "$env_file")"

  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"

  local stamp filename outfile tmpfile
  stamp="$(date +%Y-%m-%d-%H%M)"
  filename="ozsaye-${stamp}.dump"
  outfile="${BACKUP_DIR}/${filename}"
  tmpfile="${outfile}.partial"

  # yarım kalan dosyayı her çıkışta temizle (başarıda mv sonrası zaten yok)
  # shellcheck disable=SC2064
  trap "rm -f '${tmpfile}'" EXIT

  # --- dump: önce pooled (env'deki URL), gerekirse direct-host fallback ----
  local via
  if run_dump "$database_url" "$tmpfile"; then
    via="pooled"
  elif [[ "$database_url" == *-pooler.* ]] \
       && run_dump "${database_url/-pooler./.}" "$tmpfile"; then
    # Neon pooled uç (PgBouncer) bazı pg_dump işlemlerini reddedebilir;
    # host'tan '-pooler' düşürülerek direct bağlantıya düşülür.
    via="direct-fallback"
  else
    die "pg_dump başarısız (pooled + direct denendi)"
  fi

  # --- bütünlük: boyut > 1 KB ----------------------------------------------
  local size
  size="$(wc -c < "$tmpfile" | tr -d '[:space:]')"
  [[ "$size" =~ ^[0-9]+$ ]] || die "boyut okunamadı"
  (( size > 1024 )) || die "dump çok küçük (${size} B) — muhtemelen bozuk/boş"

  # --- bütünlük: pg_restore --list (aynı imaj, salt-okuma mount) ------------
  docker run --rm -v "${BACKUP_DIR}:/yedek:ro" "$IMAGE" \
    pg_restore --list "/yedek/$(basename "$tmpfile")" >/dev/null 2>&1 \
    || die "pg_restore --list doğrulaması başarısız (arşiv bozuk)"

  # doğrulandı → kalıcı ada taşı
  mv "$tmpfile" "$outfile"
  chmod 600 "$outfile"

  # --- rotasyon: en yeni KEEP kalsın ---------------------------------------
  shopt -s nullglob
  local dumps=( "${BACKUP_DIR}"/ozsaye-*.dump )
  shopt -u nullglob
  if (( ${#dumps[@]} > KEEP )); then
    local sorted=()
    mapfile -t sorted < <(printf '%s\n' "${dumps[@]}" | sort)  # ad = zaman damgası → kronolojik
    local remove=$(( ${#sorted[@]} - KEEP )) i
    for (( i=0; i<remove; i++ )); do
      rm -f -- "${sorted[i]}"
    done
  fi

  local remaining human
  shopt -s nullglob
  local after=( "${BACKUP_DIR}"/ozsaye-*.dump )
  shopt -u nullglob
  remaining=${#after[@]}
  human="$(du -h "$outfile" | cut -f1 | tr -d '[:space:]')"

  # --- özet (tek satır; PII/URL yok) — launchd bunu loglar/neon-yedek.log'a yazar
  printf '%s | %s | %s | kalan: %d | %s\n' \
    "$(date '+%Y-%m-%d %H:%M')" "$filename" "$human" "$remaining" "$via"
}

main "$@"
