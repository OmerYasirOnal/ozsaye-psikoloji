type LogoMarkProps = {
  className?: string;
};

/**
 * Özsaye Psikoloji amblemi — dairesel çerçeve içinde büyüyen figür,
 * yaprak kanopisi ve nilüfer tabanı.
 *
 * "Mürekkep" öğeleri (halka + figür) `currentColor` kullanır; böylece
 * açık zeminde forest, koyu zeminde cream olacak şekilde metin rengiyle
 * yönetilir. Yapraklar her iki zeminde de okunan sage tonlarında sabittir.
 */
export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Öz & Saye Psikoloji amblemi"
    >
      {/* Outer ring */}
      <circle cx="128" cy="128" r="96" stroke="currentColor" strokeWidth="7" />

      {/* Canopy leaves — growth & shelter */}
      <g>
        <path
          d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z"
          transform="rotate(-52 128 120)"
          fill="#92B594"
        />
        <path
          d="M128 120 C102 108 102 72 128 50 C154 72 154 108 128 120 Z"
          transform="rotate(52 128 120)"
          fill="#7A9E7C"
        />
        <path d="M128 120 L93 80" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.35" />
        <path d="M128 120 L163 80" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.3" />
      </g>

      {/* Lotus cradle — rooted, safe ground */}
      <g>
        <path d="M105 182 C92 175 92 153 105 140 C118 153 118 175 105 182 Z" transform="rotate(-40 105 182)" fill="#AFC6B0" />
        <path d="M151 182 C138 175 138 153 151 140 C164 153 164 175 151 182 Z" transform="rotate(40 151 182)" fill="#AFC6B0" />
        <path d="M128 184 C112 176 112 148 128 130 C144 148 144 176 128 184 Z" fill="#92B594" />
      </g>

      {/* Figure — reaching toward one's core */}
      <g fill="currentColor">
        <circle cx="128" cy="110" r="12" />
        <path d="M128 126 C118 136 118 154 128 168 C138 154 138 136 128 126 Z" />
      </g>
      <path d="M126 130 C112 122 102 112 100 100" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
      <path d="M130 130 C144 122 154 112 156 100" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}
