type LogoMarkProps = {
  className?: string;
};

/**
 * Öz & Saye Psikoloji amblemi — açık bir halka içinde kollarını yukarı açan
 * figür (kendi özüne doğru / iyi oluş), iki yaprak tarafından kucaklanır.
 *
 * Halka + figür ("mürekkep") `currentColor` kullanır: açık zeminde forest,
 * koyu zeminde cream/beyaz olacak şekilde metin rengiyle yönetilir. Yapraklar
 * her iki zeminde de okunan adaçayı (sage) tonlarındadır.
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
      {/* Açık halka — büyüme & açılım */}
      <path
        d="M132 25 A82 82 0 1 1 68 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Kucaklayan yapraklar */}
      <path
        d="M0 0 C-14 -10 -15 -34 0 -50 C15 -34 14 -10 0 0 Z"
        transform="translate(86 142) rotate(-43) scale(1.4)"
        fill="#A7BFA7"
      />
      <path
        d="M0 0 C-14 -10 -15 -34 0 -50 C15 -34 14 -10 0 0 Z"
        transform="translate(114 142) rotate(43) scale(1.4)"
        fill="#7E9E80"
      />

      {/* Figür — kendi özüne doğru açılan */}
      <circle cx="100" cy="64" r="9.5" fill="currentColor" />
      <path
        d="M100 76 C94 88 94 116 100 130 C106 116 106 88 100 76 Z"
        fill="currentColor"
      />
      <path
        d="M99 85 C89 80 81 69 79 58"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path
        d="M101 85 C111 80 119 69 121 58"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
