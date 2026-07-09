"use client"; // Hata sınırları Client Component olmalı

import { useEffect } from "react";

/**
 * Son çare hata sınırı: kök layout'un KENDİSİ patlarsa devreye girer ve onu
 * tamamen değiştirir. Bu yüzden kendi <html lang="tr"><body>'sini render eder
 * (Next 16 gereği) ve globals.css tema sınıflarına güvenemez — tüm stiller
 * inline, tek dosyada ve kendine yeterli. Marka paleti değerleri elle gömülü.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Yalnızca hata nesnesini kaydet (PII içermez); teşhis için.
    console.error(error);
  }, [error]);

  return (
    <html lang="tr" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "#F5F2EB",
          color: "#1F3B2E",
          fontFamily: "Montserrat, system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          textAlign: "center",
        }}
      >
        {/* global-error metadata export'unu desteklemez; React <title> kullanılır */}
        <title>Bir şeyler ters gitti | Öz & Saye Psikoloji</title>
        <main style={{ maxWidth: "32rem" }}>
          <h1
            style={{
              margin: "0 0 1rem",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2rem",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "#1F3B2E",
            }}
          >
            Bir şeyler ters gitti
          </h1>
          <p
            style={{
              margin: "0 auto 2rem",
              maxWidth: "26rem",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "#385440",
            }}
          >
            Üzgünüz, beklenmedik bir sorun oluştu. Lütfen sayfayı yenileyip
            tekrar deneyin.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              border: "none",
              borderRadius: "9999px",
              backgroundColor: "#1F3B2E",
              color: "#F5F2EB",
              fontFamily: "Montserrat, system-ui, sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </main>
      </body>
    </html>
  );
}
