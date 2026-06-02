"use client";

import { trackEvent } from "@/lib/tracking";

type CtaLinkProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
  source: string;
};

export default function CtaLink({ href, label, variant = "primary", source }: CtaLinkProps) {
  const base = "inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold tracking-wide transition-all duration-300";
  const look =
    variant === "primary"
      ? "bg-forest text-cream hover:bg-forest-dark"
      : "border border-forest/20 text-forest hover:border-forest hover:bg-forest/5";

  return (
    <a
      href={href}
      className={`${base} ${look}`}
      onClick={() => trackEvent("cta_click", { source })}
    >
      {label}
    </a>
  );
}
