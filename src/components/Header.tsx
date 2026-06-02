"use client";

import { useState, useEffect } from "react";
import LogoMark from "./LogoMark";

const navLinks = [
  { href: "#anasayfa", label: "Anasayfa" },
  { href: "#hakkimizda", label: "Hakkımızda" },
  { href: "#calisma-alanlari", label: "Çalışma Alanlarımız" },
  { href: "#biz-kimiz", label: "Biz Kimiz" },
  { href: "#yazilar", label: "Yazılar" },
  { href: "#iletisim", label: "İletişim" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <a href="#anasayfa" className="group flex items-center gap-3">
          <LogoMark className="h-11 w-11 text-forest transition-transform duration-300 group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="font-display text-xl font-semibold tracking-wide text-forest">
              Özsaye
            </span>
            <span className="font-body text-[10px] font-light tracking-[0.2em] text-sage-dark uppercase">
              Psikoloji
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:text-forest after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 after:bg-sage after:transition-all after:duration-300 hover:after:w-2/3"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <a
          href="#randevu"
          className="hidden rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-cream transition-all duration-300 hover:bg-forest-dark hover:shadow-lg hover:shadow-forest/20 lg:block"
        >
          Online Randevu
        </a>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label="Menü"
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
        className={`fixed inset-0 z-40 bg-cream transition-all duration-500 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl font-medium text-forest transition-colors hover:text-sage-dark"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#randevu"
            onClick={() => setMobileOpen(false)}
            className="mt-4 rounded-full bg-forest px-8 py-3 text-lg font-semibold text-cream transition-all hover:bg-forest-dark"
          >
            Online Randevu
          </a>
        </nav>
      </div>
    </header>
  );
}
