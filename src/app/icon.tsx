import { ImageResponse } from "next/og";

/**
 * Uygulama ikonu (favicon) — forest (#2B5233) zeminde cream (#F1EAD9) yaprak glifi.
 * Marka dilinin küçük ölçekte sade bir yansıması; harici font/asset getirilmez.
 */

export const runtime = "nodejs";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2B5233",
          borderRadius: 7,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Yaprak gövdesi — cream */}
          <path
            d="M12 2.5C7 4 3.5 8 3.5 13.5c0 4.4 3.1 7.5 7.2 7.9 0-5.6 2.2-10 7.8-13.4C17 5 14.8 3.3 12 2.5Z"
            fill="#F1EAD9"
          />
          {/* Yaprak orta damarı — forest */}
          <path
            d="M6 18C9 12 12.5 9 18.5 8"
            stroke="#2B5233"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
