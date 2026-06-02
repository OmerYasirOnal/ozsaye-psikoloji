type LogoMarkProps = {
  className?: string;
};

/**
 * Öz & Saye Psikoloji amblemi — "Figür + Kanat": kollarını açan bir figür
 * (kendi özüne doğru / iyi oluş) iki yaprak kanat arasında yükselir.
 *
 * "Mürekkep" öğeleri (figür) `currentColor` kullanır; açık zeminde forest,
 * koyu zeminde cream olacak şekilde metin rengiyle yönetilir. Yapraklar her
 * iki zeminde de okunan sage tonlarındadır.
 */
export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Öz & Saye Psikoloji amblemi"
    >
      {/* Yaprak kanatlar — büyüme & şefkat */}
      <path
        d="M0 0 C-13 -9 -13 -33 0 -46 C13 -33 13 -9 0 0 Z"
        transform="translate(86 116) rotate(-28) scale(1.5)"
        fill="#92B594"
      />
      <path
        d="M0 0 C-13 -9 -13 -33 0 -46 C13 -33 13 -9 0 0 Z"
        transform="translate(114 116) rotate(28) scale(1.5)"
        fill="#7A9E7C"
      />

      {/* Figür — kendi özüne doğru açılan */}
      <circle cx="100" cy="78" r="11" fill="currentColor" />
      <path
        d="M100 92 C92 104 92 132 100 150 C108 132 108 104 100 92 Z"
        fill="currentColor"
      />
      <path
        d="M99 100 C88 96 80 90 78 82"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M101 100 C112 96 120 90 122 82"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
