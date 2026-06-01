import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

/**
 * Sosyal paylaşım (Open Graph / Twitter) görseli.
 *
 * Tasarım: forest (#2B5233) zemin, cream (#F1EAD9) metin, marka kısa adı
 * ("Özsaye Psikoloji") başlık olarak, altında sade bir kategori betimi ve
 * sage tonlarında basit bir yaprak motifi.
 *
 * NOT: site.slogan şu an "[DOLDUR] " ön-ekli bir PLACEHOLDER olduğundan burada
 * KULLANILMAZ — uydurma bir slogan paylaşıma yansımasın. Yerine, marka
 * kategorisini betimleyen gerçek/güvenli bir alt başlık kullanılır.
 * Ayrıca HARİCİ font getirilmez (build'i kırmamak için); serif his için
 * sistem serif yığını yeterlidir.
 */

// next/og dinamik render gerektirir; statik dışa aktarımı kapatıyoruz.
export const runtime = "nodejs";

export const alt = "Özsaye Psikoloji";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // forest zemin + üstte forest-light'a doğru çok hafif dikey degrade
          background: "linear-gradient(160deg, #3A6B45 0%, #2B5233 55%, #1E3A24 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        {/* İnce sage çerçeve — markanın yumuşak ayraç dilini yansıtır */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 40,
            bottom: 40,
            border: "2px solid rgba(146, 181, 148, 0.45)",
            borderRadius: 28,
            display: "flex",
          }}
        />

        {/* Yaprak motifi (sade SVG) */}
        <svg
          width="92"
          height="92"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 28 }}
        >
          {/* Yaprak gövdesi */}
          <path
            d="M12 2.5C7 4 3.5 8 3.5 13.5c0 4.4 3.1 7.5 7.2 7.9 0-5.6 2.2-10 7.8-13.4C17 5 14.8 3.3 12 2.5Z"
            fill="#AFC6B0"
          />
          {/* Yaprak orta damarı */}
          <path
            d="M6 18C9 12 12.5 9 18.5 8"
            stroke="#2B5233"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Başlık — marka kısa adı (gerçek değer) */}
        <div
          style={{
            display: "flex",
            fontSize: 116,
            fontWeight: 600,
            color: "#F1EAD9",
            letterSpacing: -1,
            lineHeight: 1,
          }}
        >
          {site.shortName}
        </div>

        {/* Sage gradient ayraç */}
        <div
          style={{
            width: 220,
            height: 3,
            marginTop: 36,
            marginBottom: 30,
            background:
              "linear-gradient(90deg, rgba(146,181,148,0) 0%, #92B594 50%, rgba(146,181,148,0) 100%)",
            display: "flex",
          }}
        />

        {/* Güvenli kategori betimi (slogan placeholder olduğu için kullanılmaz) */}
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontStyle: "italic",
            color: "#E5D9C3",
            letterSpacing: 1,
          }}
        >
          Psikoloji ve Danışmanlık
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
