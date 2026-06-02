import LogoMark from "./LogoMark";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-forest text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11 text-cream" />
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold">
                  Öz &amp; Saye
                </span>
                <span className="text-[10px] font-light tracking-[0.2em] text-cream/60 uppercase">
                  Psikoloji
                </span>
              </div>
            </div>
            <p className="mt-4 font-display text-lg italic text-cream/70">
              &ldquo;Güvenli Bir Bölgede
              <br />
              Kendi Özüne Doğru.&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-widest text-sage uppercase">
              Sayfalar
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/#anasayfa", label: "Anasayfa" },
                { href: "/#hakkimizda", label: "Hakkımızda" },
                { href: "/#calisma-alanlari", label: "Çalışma Alanlarımız" },
                { href: "/#biz-kimiz", label: "Biz Kimiz" },
                { href: "/blog", label: "Yazılar" },
                { href: "/#iletisim", label: "İletişim" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/60 transition-colors hover:text-cream"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-widest text-sage uppercase">
              Hizmetlerimiz
            </h4>
            <ul className="space-y-3">
              {[
                "Bireysel Psikoterapi",
                "Çift Terapisi",
                "Aile Danışmanlığı",
                "Çocuk & Ergen Terapisi",
                "Travma Terapisi",
              ].map((item) => (
                <li key={item}>
                  <span className="text-sm text-cream/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-widest text-sage uppercase">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-sm text-cream/60">
                  İstanbul, Türkiye
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="text-sm text-cream/60">
                  +90 (5XX) XXX XX XX
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </svg>
                <span className="text-sm text-cream/60">
                  info@ozsayepsikoloji.com
                </span>
              </li>
            </ul>

            {/* Social links */}
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Instagram",
                  icon: (
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                  ),
                },
                {
                  label: "LinkedIn",
                  icon: (
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/60 transition-all hover:border-sage hover:text-sage"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-8 md:flex-row">
          <p className="text-xs text-cream/40">
            &copy; {currentYear} Öz &amp; Saye Psikoloji. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-cream/40 transition-colors hover:text-cream/70"
            >
              Gizlilik Politikası
            </a>
            <a
              href="#"
              className="text-xs text-cream/40 transition-colors hover:text-cream/70"
            >
              KVKK Aydınlatma Metni
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
