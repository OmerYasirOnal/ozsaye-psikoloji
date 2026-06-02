import Link from "next/link";
import LogoMark from "./LogoMark";
import { services } from "@/lib/services";
import { site, isReady } from "@/lib/site";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      label: "Instagram",
      href: site.social.instagram,
      icon: (
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
      ),
    },
    {
      label: "LinkedIn",
      href: site.social.linkedin,
      icon: (
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      ),
    },
  ].filter((social): social is { label: string; href: string; icon: typeof social.icon } =>
    Boolean(social.href)
  );

  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11 text-cream" />
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold">
                  Öz &amp; Saye
                </span>
                <span className="font-body text-[10px] tracking-[0.2em] text-sage-light uppercase">
                  Psikoloji
                </span>
              </div>
            </div>
            <p className="mt-6 font-display text-lg leading-relaxed italic text-sage-light">
              &ldquo;Güvenli Bir Bölgede
              <br />
              Kendi Özüne Doğru.&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] text-cream uppercase">
              Sayfalar
            </h4>
            <span aria-hidden="true" className="mt-4 block h-px w-12 bg-cream/20" />
            <ul className="mt-5 space-y-3">
              {[
                { href: "/#anasayfa", label: "Anasayfa" },
                { href: "/#hakkimizda", label: "Hakkımızda" },
                { href: "/#calisma-alanlari", label: "Çalışma Alanlarımız" },
                { href: "/#biz-kimiz", label: "Biz Kimiz" },
                { href: "/yazilar", label: "Yazılar" },
                { href: "/#iletisim", label: "İletişim" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-sage-light transition-colors duration-300 hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] text-cream uppercase">
              Hizmetlerimiz
            </h4>
            <span aria-hidden="true" className="mt-4 block h-px w-12 bg-cream/20" />
            <ul className="mt-5 space-y-3">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/hizmetler/${s.slug}`}
                    className="group inline-flex items-center gap-1.5 font-body text-sm text-sage-light transition-colors duration-300 hover:text-cream"
                  >
                    {s.title}
                    <span
                      aria-hidden="true"
                      className="text-sage transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] text-cream uppercase">
              İletişim
            </h4>
            <span aria-hidden="true" className="mt-4 block h-px w-12 bg-cream/20" />
            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="font-body text-sm text-sage-light">
                  {isReady(site.address.streetAddress)
                    ? site.address.full
                    : "Adres bilgisi yakında"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {isReady(site.phone.e164) ? (
                  <a
                    href={site.phone.href}
                    className="font-body text-sm text-sage-light transition-colors duration-300 hover:text-cream"
                  >
                    {site.phone.display}
                  </a>
                ) : (
                  <span className="font-body text-sm text-sage-light">
                    Telefon yakında
                  </span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                {isReady(site.email.address) ? (
                  <a
                    href={site.email.href}
                    className="font-body text-sm text-sage-light transition-colors duration-300 hover:text-cream"
                  >
                    {site.email.address}
                  </a>
                ) : (
                  <span className="font-body text-sm text-sage-light">
                    E-posta yakında
                  </span>
                )}
              </li>
            </ul>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-sage-light transition-colors duration-300 hover:text-cream"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      {social.icon}
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 md:flex-row">
          <p className="font-body text-xs text-sage-light">
            &copy; {currentYear} Öz &amp; Saye Psikoloji. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            <Link
              href="/gizlilik-politikasi"
              className="font-body text-xs text-sage-light transition-colors duration-300 hover:text-cream"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kvkk-aydinlatma-metni"
              className="font-body text-xs text-sage-light transition-colors duration-300 hover:text-cream"
            >
              KVKK Aydınlatma Metni
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
