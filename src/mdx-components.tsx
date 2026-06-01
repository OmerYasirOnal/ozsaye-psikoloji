import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/**
 * MDX içeriği (blog yazıları) için global bileşen eşlemeleri — App Router'da
 * `@next/mdx` kullanımı için ZORUNLU dosya. Markdown öğelerini marka diline
 * ("sakin botanik minimalizm") uygun, okunabilir prose stillerine eşler:
 * yalnızca text-forest (başlık) / text-forest-muted (gövde), sage aksan.
 */
export function useMDXComponents(): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="mt-12 font-display text-2xl leading-tight font-light text-forest lg:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 font-display text-xl font-medium text-forest">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-5 text-base leading-relaxed text-forest-muted">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2.5 pl-5 text-base leading-relaxed text-forest-muted marker:text-sage">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-base leading-relaxed text-forest-muted marker:text-sage">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1.5">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold text-forest">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    a: ({ href, children }: ComponentPropsWithoutRef<"a">) => (
      <Link
        href={href ?? "#"}
        className="font-medium text-forest underline decoration-sage/50 underline-offset-[3px] transition-colors hover:decoration-forest"
      >
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-sage/60 pl-5 font-display text-lg leading-relaxed italic text-forest">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-0 border-t border-sage/20" />,
  };
}
