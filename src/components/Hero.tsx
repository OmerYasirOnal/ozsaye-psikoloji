import Cta from "./Cta";
import Parallax from "./Parallax";

export default function Hero() {
  return (
    <section
      id="anasayfa"
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-warm-white px-6"
    >
      {/* Tek, çok hafif atmosfer: üst-merkezde sıcak sage ışıması (sade derinlik) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12%] h-[62vh] w-[62vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(167,191,167,0.16),transparent_68%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Tek zarif botanik imza */}
        <Parallax speed={0.12} className="mx-auto mb-8 w-fit">
          <svg
            aria-hidden="true"
            className="hero-animate h-9 w-9 text-sage"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22V10" />
            <path d="M12 12c-3.3 0-6-2.7-6-6 3.3 0 6 2.7 6 6Z" />
            <path d="M12 10.5c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
          </svg>
        </Parallax>

        {/* Eyebrow */}
        <p className="hero-animate hero-animate-delay-1 font-body text-xs font-medium tracking-[0.25em] text-forest-muted uppercase">
          Psikolojik Danışmanlık &amp; Klinik Psikoloji
        </p>

        {/* Başlık — marka sloganı, zarif Playfair Display, tek italik vurgu */}
        <h1 className="hero-animate hero-animate-delay-1 mt-6 font-display text-5xl leading-[1.06] font-light tracking-tight text-forest sm:text-6xl lg:text-7xl">
          Güvenli bir bölgede
          <br />
          <span className="italic">kendi özüne doğru.</span>
        </h1>

        {/* Alt metin */}
        <p className="hero-animate hero-animate-delay-2 mx-auto mt-7 max-w-xl font-body text-lg leading-relaxed text-forest-muted">
          Kendinizi güvende hissedeceğiniz bir alanda; profesyonel, etik ve
          bilimsel bir yaklaşımla içsel yolculuğunuza eşlik ediyoruz.
        </p>

        {/* CTA — tek birincil eylem + sessiz ikincil bağlantı */}
        <div className="hero-animate hero-animate-delay-3 mt-10 flex flex-col items-center justify-center gap-x-8 gap-y-5 sm:flex-row">
          <Cta href="#randevu">Online Randevu Al</Cta>
          <Cta href="#hakkimizda" variant="ghost" icon={false}>
            Bizi tanıyın
          </Cta>
        </div>
      </div>
    </section>
  );
}
