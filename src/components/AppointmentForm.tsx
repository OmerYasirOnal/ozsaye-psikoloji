"use client";

import { useState, FormEvent } from "react";

export default function AppointmentForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="randevu" className="relative overflow-hidden bg-forest py-24 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-forest-light/20" />
        <div className="absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full bg-sage/5" />
        <svg
          className="absolute right-[10%] top-[15%] h-20 w-20 text-sage/10"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <path d="M50 0 C20 30 5 70 15 110 C25 130 40 140 50 140 C60 140 75 130 85 110 C95 70 80 30 50 0Z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Info */}
          <div className="text-cream">
            <span className="inline-block rounded-full border border-sage/30 px-4 py-1.5 text-xs font-semibold tracking-widest text-sage uppercase">
              Online Randevu
            </span>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light lg:text-5xl">
              Başvuru Formu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream/70">
              Aşağıdaki formu doldurarak online randevu talebinde
              bulunabilirsiniz. En kısa sürede sizinle iletişime geçeceğiz.
            </p>

            <div className="mt-10 space-y-6">
              {[
                {
                  icon: (
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  ),
                  text: "Formu doldurun, sizi arayalım",
                },
                {
                  icon: (
                    <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>
                  ),
                  text: "Hafta içi 09:00 - 19:00 arası hizmet",
                },
                {
                  icon: (
                    <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>
                  ),
                  text: "Online ve yüz yüze seanslar",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/20">
                    <svg
                      className="h-5 w-5 text-sage"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <span className="text-sm text-cream/80">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl bg-cream/95 p-8 shadow-2xl backdrop-blur-sm lg:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
                  <svg
                    className="h-8 w-8 text-forest"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-forest">
                  Başvurunuz Alındı
                </h3>
                <p className="mt-2 text-sm text-forest/60">
                  En kısa sürede sizinle iletişime geçeceğiz.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Adınız Soyadınız"
                      className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="05XX XXX XX XX"
                      className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                    E-posta
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest/30 transition-all"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                      Uzman Tercihi
                    </label>
                    <select
                      required
                      className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest transition-all"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Seçiniz
                      </option>
                      <option value="melek">Psk. Dan. Melek Yıldız</option>
                      <option value="sacide">Kl. Psk. Sacide Şahin</option>
                      <option value="farketmez">Farketmez</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                      Tercih Edilen Tarih
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-wider text-forest/70 uppercase">
                    Mesajınız
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Başvurunuzla ilgili eklemek istediğiniz bilgiler..."
                    className="w-full resize-none rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-forest px-6 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-300 hover:bg-forest-dark hover:shadow-lg hover:shadow-forest/30"
                >
                  Randevu Talebini Gönder
                </button>

                <p className="text-center text-xs text-forest/40">
                  Bilgileriniz gizlilik ilkemiz gereği korunmaktadır.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
