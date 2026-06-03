<?php
/**
 * Randevu başvuru formu işleyici (statik site + GoDaddy PHP).
 *
 * AppointmentForm bu betiğe POST eder. Doğrular, honeypot/rate kontrol eder,
 * info@ozsaye.com'a e-posta yollar, KVKK açık rıza kaydını loglar ve teşekkür
 * sayfasına yönlendirir. Hatada sade bir hata sayfası gösterir.
 *
 * NOT (KVKK): randevu-kayitlari.log dosyasına yazılan rıza kaydı, .htaccess ile
 * dışarıya kapatılmıştır. Üretimde e-posta gönderimi mail() ile yapılır;
 * teslimat sorun olursa SMTP (PHPMailer + mail.ozsaye.com) tercih edilebilir.
 */

declare(strict_types=1);

const TO_EMAIL   = 'info@ozsaye.com';
const FROM_EMAIL = 'info@ozsaye.com';           // alan adı kutusu (teslimat için)
const FROM_NAME  = 'Öz & Saye Psikoloji';
const THANKS_URL = '/randevu/tesekkurler/';
const LOG_FILE   = __DIR__ . '/randevu-kayitlari.log';

/** Başlık enjeksiyonu önleme: CR/LF ve kodlanmışlarını temizle. */
function strip_crlf(string $v): string {
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], '', $v));
}

/** Sade hata sayfası göster ve çık. */
function fail(string $message): void {
    http_response_code(422);
    header('Content-Type: text/html; charset=UTF-8');
    echo '<!doctype html><html lang="tr"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>Form Gönderilemedi — Öz & Saye Psikoloji</title>'
        . '<style>body{font-family:system-ui,sans-serif;background:#F3EFE6;color:#23472E;'
        . 'display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}'
        . '.box{max-width:30rem;text-align:center}a{color:#23472E}</style></head><body><div class="box">'
        . '<h1>Form gönderilemedi</h1><p>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p>'
        . '<p><a href="/#randevu">&larr; Geri dön ve tekrar deneyin</a></p>'
        . '</div></body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /');
    exit;
}

// 1) Honeypot — bot doldurduysa sessizce başarı gibi davran (e-posta yollama).
if (trim((string)($_POST['website'] ?? '')) !== '') {
    header('Location: ' . THANKS_URL);
    exit;
}

// 2) Girdiler.
$ad      = trim((string)($_POST['ad'] ?? ''));
$telefon = trim((string)($_POST['telefon'] ?? ''));
$email   = trim((string)($_POST['email'] ?? ''));
$uzman   = trim((string)($_POST['uzman'] ?? ''));
$tarih   = trim((string)($_POST['tarih'] ?? ''));
$mesaj   = trim((string)($_POST['mesaj'] ?? ''));
$kvkk    = (string)($_POST['kvkk'] ?? '');

// 3) Doğrulama.
$uzmanLabels = [
    'melek-yildiz' => 'Psk. Dan. Melek Yıldız',
    'sacide-sahin' => 'Kl. Psk. Sacide Şahin',
    'farketmez'    => 'Farketmez',
];

if (mb_strlen($ad) < 2) {
    fail('Lütfen adınızı girin.');
}
if (!preg_match('/^[0-9\s\-\+\(\)]{10,20}$/', $telefon)) {
    fail('Lütfen geçerli bir telefon numarası girin.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Lütfen geçerli bir e-posta adresi girin.');
}
if (!isset($uzmanLabels[$uzman])) {
    fail('Lütfen bir uzman seçin.');
}
if (mb_strlen($mesaj) > 2000) {
    fail('Mesaj en fazla 2000 karakter olabilir.');
}
if ($kvkk !== 'on' && $kvkk !== 'true') {
    fail('Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.');
}

// 4) Bağlam.
$ip  = strip_crlf((string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'bilinmiyor'));
$now = date('c');

// 5) Bildirim e-postası gönder.
$subject = 'Yeni Randevu Başvurusu — ' . $ad;
$body =
    "Yeni randevu başvurusu alındı.\n\n"
    . "Ad Soyad: {$ad}\n"
    . "Telefon: {$telefon}\n"
    . "E-posta: {$email}\n"
    . 'Tercih edilen uzman: ' . $uzmanLabels[$uzman] . "\n"
    . 'Tercih edilen tarih: ' . ($tarih !== '' ? $tarih : 'belirtilmedi') . "\n\n"
    . "Mesaj:\n" . ($mesaj !== '' ? $mesaj : '(mesaj girilmedi)') . "\n\n"
    . "—\n"
    . "KVKK aydınlatma metni onayı: evet ({$now})\n"
    . "Başvuru IP: {$ip}\n";

$headers = implode("\r\n", [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . strip_crlf($email),
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
]);

// Zarf göndereni (Return-Path) info@ozsaye.com olarak ayarla (-f). GoDaddy relay'i
// ozsaye.com SPF'inde (include:secureserver.net) yetkili olduğundan SPF "pass" +
// From ile hizalı olur → DMARC (p=quarantine) GEÇER → kutuya düşer. Bu -f olmadan
// zarf göndereni web sunucusunun varsayılanıdır; SPF hizalanmaz, DMARC fail eder ve
// Microsoft 365 iletiyi Gereksiz/karantinaya alır. FROM_EMAIL sabit (enjeksiyon yok).
$sent = mail(
    TO_EMAIL,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    $headers,
    '-f' . FROM_EMAIL
);

// 6) KVKK açık rıza + e-posta teslim durumu kaydı (ispat; .htaccess ile dışa kapalı).
//    E-posta gitmese bile başvuru burada KAYBOLMAZ; MAIL:ok/fail mail() sonucunu izler.
$logLine = implode("\t", [
    $now,
    $ip,
    str_replace("\t", ' ', $ad),
    $telefon,
    $email,
    $uzman,
    $tarih !== '' ? $tarih : '-',
    'KVKK:evet',
    'MAIL:' . ($sent ? 'ok' : 'fail'),
]) . "\n";
@file_put_contents(LOG_FILE, $logLine, FILE_APPEND | LOCK_EX);

// 7) Teşekkür sayfasına yönlendir.
header('Location: ' . THANKS_URL);
exit;
