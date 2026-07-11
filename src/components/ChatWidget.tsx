"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ServiceIcon } from "./ServiceIcon";

type Mesaj = { rol: "kullanici" | "asistan"; icerik: string };

const KARSILAMA: Mesaj = {
  rol: "asistan",
  icerik:
    "Merhaba! Hizmetlerimiz, randevu süreci veya ücretler hakkında sorularınızı yanıtlayabilirim. Nasıl yardımcı olabilirim?",
};

export default function ChatWidget() {
  const [acik, setAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([KARSILAMA]);
  const [girdi, setGirdi] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function gonder(e: FormEvent) {
    e.preventDefault();
    const metin = girdi.trim();
    if (!metin || gonderiliyor) return;

    const gecmis = mesajlar.slice(-6);
    setMesajlar((onceki) => [...onceki, { rol: "kullanici", icerik: metin }]);
    setGirdi("");
    setGonderiliyor(true);

    try {
      const yanit = await fetch("/api/asistan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesaj: metin, gecmis }),
      });
      const veri = await yanit.json();
      setMesajlar((onceki) => [
        ...onceki,
        { rol: "asistan", icerik: veri.cevap ?? "Şu anda cevap veremiyorum." },
      ]);
    } catch {
      setMesajlar((onceki) => [
        ...onceki,
        {
          rol: "asistan",
          icerik: "Şu anda cevap veremiyorum, lütfen daha sonra tekrar deneyin.",
        },
      ]);
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-24 z-40 lg:bottom-6">
      {acik && (
        <div className="mb-3 flex h-[28rem] w-[20rem] flex-col overflow-hidden rounded-lg border border-stone bg-warm-white shadow-xl sm:w-[22rem]">
          <div className="border-b border-stone bg-forest px-4 py-3">
            <p className="font-display text-sm font-medium text-cream">
              Öz &amp; Saye Asistan
            </p>
            <p className="text-xs text-sage-light">
              Ben bir yapay zekayım, gerçek bir uzman değilim. Kişisel bir konu için
              lütfen randevu alın.
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {mesajlar.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  m.rol === "asistan" ? "bg-cream text-forest" : "ml-auto bg-forest text-cream"
                }`}
              >
                {m.icerik}
              </div>
            ))}
            {gonderiliyor && (
              <div className="max-w-[85%] rounded-lg bg-cream px-3 py-2 text-sm text-forest-muted">
                Yazıyor…
              </div>
            )}
          </div>

          <div className="border-t border-stone px-3 py-2">
            <Link
              href="/randevu"
              className="mb-2 block text-center text-xs text-forest-muted underline underline-offset-2"
            >
              Doğrudan randevu almak için tıklayın
            </Link>
            <form onSubmit={gonder} className="flex gap-2">
              <input
                type="text"
                value={girdi}
                onChange={(e) => setGirdi(e.target.value)}
                placeholder="Sorunuzu yazın…"
                maxLength={500}
                className="min-w-0 flex-1 rounded-md border border-stone bg-warm-white px-3 py-2 text-sm text-forest focus-visible:outline-2 focus-visible:outline-sage"
              />
              <button
                type="submit"
                disabled={gonderiliyor || !girdi.trim()}
                className="rounded-md bg-forest px-3 py-2 text-sm text-cream disabled:opacity-50"
              >
                Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        aria-label={acik ? "Asistanı kapat" : "Asistanı aç"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-cream shadow-lg"
      >
        <ServiceIcon name="chat" className="h-6 w-6 text-cream" />
      </button>
    </div>
  );
}
