"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  randevuTalebiGonder,
  type RandevuFormState,
} from "@/app/randevu/actions";

/**
 * Randevu başvuru formu.
 *
 * `randevuTalebiGonder` public Server Action'ına POST eder (useActionState):
 * action honeypot + zod + IP hız limiti ile korunur, talebi DB'ye yazar,
 * uzman(lar)a bildirim e-postası gönderir ve /randevu/tesekkurler/'e yönlendirir.
 * İstemci tarafı: HTML5 `required`/tip doğrulaması; sunucu doğrulaması zod'da.
 */
const initial: RandevuFormState = {};

export default function AppointmentForm() {
  const [state, formAction, pending] = useActionState(
    randevuTalebiGonder,
    initial,
  );

  return (
    <section id="randevu" className="relative bg-forest py-28 lg:py-40">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Info */}
          <div className="text-cream">
            <p className="font-body text-xs font-medium tracking-[0.25em] text-sage-light uppercase">
              Online Randevu
            </p>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light lg:text-5xl">
              Başvuru Formu
            </h2>
            <p className="mt-4 text-base leading-relaxed text-sage-light">
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
                      aria-hidden="true"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <span className="text-sm text-sage-light">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form — randevuTalebiGonder Server Action'ına POST */}
          <div className="rounded-2xl bg-cream/95 p-8 shadow-2xl backdrop-blur-sm lg:p-10">
            <form action={formAction} className="space-y-5">
              {/* Honeypot: görsel + ekran okuyuculardan gizli; botlar doldurur */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              >
                <label htmlFor="website">Web sitesi (boş bırakın)</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ad"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                  >
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="ad"
                    name="ad"
                    autoComplete="name"
                    required
                    minLength={2}
                    placeholder="Adınız Soyadınız"
                    className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest-muted transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="telefon"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                  >
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="telefon"
                    name="telefon"
                    autoComplete="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest-muted transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                >
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="ornek@email.com"
                  className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest-muted transition-all"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="uzman"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                  >
                    Uzman Tercihi
                  </label>
                  <select
                    id="uzman"
                    name="uzman"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest transition-all"
                  >
                    <option value="" disabled>
                      Seçiniz
                    </option>
                    <option value="melek-yildiz">Psk. Dan. Melek Yıldız</option>
                    <option value="sacide-sahin">Kl. Psk. Sacide Şahin</option>
                    <option value="farketmez">Farketmez</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="tarih"
                    className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                  >
                    Tercih Edilen Tarih
                  </label>
                  <input
                    type="date"
                    id="tarih"
                    name="tarih"
                    className="w-full rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="mesaj"
                  className="mb-1.5 block text-xs font-semibold tracking-wider text-forest-muted uppercase"
                >
                  Mesajınız
                </label>
                <textarea
                  id="mesaj"
                  name="mesaj"
                  rows={4}
                  maxLength={2000}
                  placeholder="Başvurunuzla ilgili eklemek istediğiniz bilgiler..."
                  className="w-full resize-none rounded-lg border border-sage/20 bg-warm-white px-4 py-3 text-sm text-forest placeholder:text-forest-muted transition-all"
                />
              </div>

              {/* KVKK açık rıza */}
              <div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="kvkk"
                    name="kvkk"
                    required
                    aria-describedby="kvkk-note"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-sage/40 text-forest accent-forest"
                  />
                  <label htmlFor="kvkk" className="text-xs leading-relaxed text-forest-muted">
                    <Link
                      href="/kvkk-aydinlatma-metni"
                      className="font-semibold text-forest underline underline-offset-2 hover:text-forest-dark"
                    >
                      KVKK Aydınlatma Metni
                    </Link>{" "}
                    ve{" "}
                    <Link
                      href="/gizlilik-politikasi"
                      className="font-semibold text-forest underline underline-offset-2 hover:text-forest-dark"
                    >
                      Gizlilik Politikası
                    </Link>
                    &apos;nı okudum; kişisel verilerimin başvurumun
                    değerlendirilmesi amacıyla işlenmesine açık rıza veriyorum.
                  </label>
                </div>
                <p id="kvkk-note" className="mt-2 text-xs text-forest-muted">
                  Lütfen bu formda sağlık durumunuza ilişkin özel nitelikli
                  (hassas) bilgileri paylaşmayın; bu tür ayrıntıları
                  görüşmemizde ele alacağız.
                </p>
              </div>

              {state.hata && (
                <p className="text-sm font-semibold text-forest">{state.hata}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-forest px-6 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-300 hover:bg-forest-dark hover:shadow-lg hover:shadow-forest/30 disabled:opacity-60"
              >
                {pending ? "Gönderiliyor…" : "Randevu Talebini Gönder"}
              </button>

              <p className="text-center text-xs text-forest-muted">
                Bilgileriniz gizlilik ilkemiz gereği korunmaktadır.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
