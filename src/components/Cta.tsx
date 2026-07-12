import Link from "next/link";

const VARIANTS = {
  primary:
    "rounded-full bg-forest px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-forest-dark motion-reduce:transition-none",
  secondary:
    "rounded-full border-2 border-forest/20 px-6 py-3 text-sm font-semibold text-forest transition-all duration-300 hover:border-forest hover:bg-forest hover:text-cream motion-reduce:transition-none",
  ghost:
    "text-sm font-semibold text-forest underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest motion-reduce:transition-none",
} as const;

/**
 * Sitedeki tekrarlayan çağrı-eylem bağlantısı. Üç varyant, sitenin zaten farklı
 * yerlerde kullandığı üç görsel dilin (dolu forest hap / ince çerçeveli hap /
 * altı çizili metin) tekilleştirilmiş hali — yeni bir görsel dil eklenmez.
 * Bir bölümde yalnızca BİR `primary` olması, geri kalanının `secondary`/`ghost`
 * kalması görsel hiyerarşiyi korur.
 */
export default function Cta({
  href,
  children,
  variant = "primary",
  icon = true,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  icon?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 font-body ${VARIANTS[variant]} ${className}`}
    >
      {children}
      {icon && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 no-underline transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </Link>
  );
}
