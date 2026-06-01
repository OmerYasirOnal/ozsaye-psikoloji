"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/#anasayfa", label: "Anasayfa" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#calisma-alanlari", label: "Çalışma Alanlarımız" },
  { href: "/#biz-kimiz", label: "Biz Kimiz" },
  { href: "/yazilar", label: "Yazılar" },
  { href: "/#iletisim", label: "İletişim" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  // Menü en az bir kez açıldı mı? İlk mount'ta odağı butona kaçırmamak için.
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Açılınca ilk menü linkine odaklan; kapanınca odağı menü butonuna geri ver.
  // İlk mount'ta (menü hiç açılmadan) odağı butona taşıma.
  useEffect(() => {
    if (mobileOpen) {
      hasOpenedRef.current = true;
      const first = mobileMenuRef.current?.querySelector<HTMLElement>("a[href]");
      first?.focus();
    } else if (hasOpenedRef.current) {
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  // ESC ile kapat + basit focus-trap (Tab overlay içinde dönsün).
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const menu = mobileMenuRef.current;
      if (!menu) return;
      const focusable = menu.querySelectorAll<HTMLElement>("a[href]");
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md shadow-[0_1px_12px_rgba(43,82,51,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/#anasayfa" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-forest transition-colors group-hover:bg-forest group-hover:text-cream">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22c-4-3-8-7.5-8-12a8 8 0 0 1 16 0c0 4.5-4 9-8 12z" />
              <path d="M12 6v8" />
              <path d="M9 9c1.5 1 4.5 1 6 0" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold tracking-wide text-forest">
              Özsaye
            </span>
            <span className="font-body text-[10px] font-light tracking-[0.2em] text-forest-muted uppercase">
              Psikoloji
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-forest-muted transition-colors hover:text-forest after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-sage after:transition-all after:duration-300 hover:after:w-2/3"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <Link
          href="/#randevu"
          className="hidden rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:bg-forest-dark hover:shadow-lg hover:shadow-forest/20 lg:block"
        >
          Online Randevu
        </Link>

        {/* Mobile menu button */}
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobil-menu"
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          <span
            className={`h-[2px] w-6 bg-forest transition-all duration-300 ${
              mobileOpen ? "translate-y-[5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-forest transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-forest transition-all duration-300 ${
              mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        id="mobil-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        inert={!mobileOpen}
        className={`fixed inset-0 z-40 bg-cream transition-all duration-500 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav
          ref={mobileMenuRef}
          className="flex h-full flex-col items-center justify-center gap-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl font-medium text-forest transition-colors hover:text-forest-light"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#randevu"
            onClick={() => setMobileOpen(false)}
            className="mt-4 rounded-full bg-forest px-8 py-3 text-lg font-semibold text-cream transition-all hover:bg-forest-dark"
          >
            Online Randevu
          </Link>
        </nav>
      </div>
    </header>
  );
}
