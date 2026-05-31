export default function Hero() {
  return (
    <section
      id="anasayfa"
      className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6"
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large circle */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-sage/10" />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-sage/8" />

        {/* Floating leaves */}
        <svg
          className="leaf-float absolute right-[15%] top-[20%] h-24 w-24 text-sage/20"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <path d="M50 0 C20 30 5 70 15 110 C25 130 40 140 50 140 C60 140 75 130 85 110 C95 70 80 30 50 0Z" />
          <path
            d="M50 20 L50 120"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
        <svg
          className="leaf-float-slow absolute bottom-[25%] left-[10%] h-16 w-16 text-forest/10"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <path d="M50 0 C20 30 5 70 15 110 C25 130 40 140 50 140 C60 140 75 130 85 110 C95 70 80 30 50 0Z" />
        </svg>
        <svg
          className="leaf-float absolute left-[20%] top-[15%] h-12 w-12 rotate-45 text-sage/15"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <path d="M50 0 C20 30 5 70 15 110 C25 130 40 140 50 140 C60 140 75 130 85 110 C95 70 80 30 50 0Z" />
        </svg>

        {/* Decorative lines */}
        <div className="absolute left-1/2 top-0 h-32 w-px bg-gradient-to-b from-transparent via-sage/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Small badge */}
        <div className="hero-animate mb-8 inline-flex items-center gap-2 rounded-full border border-sage/30 bg-warm-white/60 px-5 py-2 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-sage" />
          <span className="font-body text-xs font-medium tracking-widest text-forest/70 uppercase">
            Psikolojik Danışmanlık &amp; Klinik Psikoloji
          </span>
        </div>

        {/* Slogan */}
        <h1 className="hero-animate hero-animate-delay-1 font-display text-5xl leading-tight font-light tracking-tight text-forest sm:text-6xl md:text-7xl lg:text-8xl">
          Güvenli Bir Bölgede
          <br />
          <span className="font-medium italic text-forest">
            Kendi Özüne Doğru.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-animate hero-animate-delay-2 mx-auto mt-8 max-w-xl font-body text-lg leading-relaxed font-light text-forest/70">
          Profesyonel psikolojik danışmanlık ve klinik psikoloji hizmetleriyle,
          kendinizi güvende hissedeceğiniz bir alanda içsel yolculuğunuza eşlik
          ediyoruz.
        </p>

        {/* CTA buttons */}
        <div className="hero-animate hero-animate-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#randevu"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-4 font-body text-sm font-semibold tracking-wide text-cream transition-all duration-300 hover:bg-forest-dark hover:shadow-xl hover:shadow-forest/20"
          >
            Online Randevu Al
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#hakkimizda"
            className="inline-flex items-center gap-2 rounded-full border-2 border-forest/20 px-8 py-4 font-body text-sm font-semibold tracking-wide text-forest transition-all duration-300 hover:border-forest hover:bg-forest/5"
          >
            Bizi Tanıyın
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-animate hero-animate-delay-3 absolute bottom-8 left-1/2 -translate-x-1/2">
        <a
          href="#hakkimizda"
          className="flex flex-col items-center gap-2 text-forest/40 transition-colors hover:text-forest/70"
        >
          <span className="font-body text-[10px] tracking-[0.3em] uppercase">
            Keşfet
          </span>
          <svg
            className="h-5 w-5 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
