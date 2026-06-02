type LogoMarkProps = {
  className?: string;
};

/**
 * Öz & Saye Psikoloji final amblemi.
 *
 * Kollarını açan figür, koruyucu yarım çember, adaçayı yaprakları ve
 * yumuşak pembe iç yapraklarla güven, denge ve iyileşme çağrışımı kurar.
 * Koyu ana öğeler currentColor ile yönetilir; açık zeminde forest,
 * koyu zeminde krem kullanılabilir.
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
      <path
        d="M44 88 A56 56 0 0 1 156 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M100 95 C93 76 81 62 63 51 C76 53 91 61 100 79 C109 61 124 53 137 51 C119 62 107 76 100 95Z"
        fill="currentColor"
      />
      <circle cx="100" cy="40" r="8.5" fill="currentColor" />
      <path
        d="M37 91 C52 92 72 105 86 131 C63 126 43 114 30 97 C27 92 30 90 37 91Z"
        fill="#A6B79B"
      />
      <path
        d="M163 91 C148 92 128 105 114 131 C137 126 157 114 170 97 C173 92 170 90 163 91Z"
        fill="#A6B79B"
      />
      <path
        d="M76 98 C86 107 92 119 95 133 C82 126 73 114 69 98 C68 95 72 95 76 98Z"
        fill="#D8A7A5"
      />
      <path
        d="M124 98 C114 107 108 119 105 133 C118 126 127 114 131 98 C132 95 128 95 124 98Z"
        fill="#D8A7A5"
      />
      <path
        d="M48 102 C57 111 68 119 81 126"
        fill="none"
        stroke="#F5F2EB"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M152 102 C143 111 132 119 119 126"
        fill="none"
        stroke="#F5F2EB"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
