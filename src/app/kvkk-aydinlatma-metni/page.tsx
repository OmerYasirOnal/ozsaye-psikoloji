import type { Metadata } from "next";
import Link from "next/link";

import { isReady, site } from "@/lib/site";

const HENUZ_DOLDURULMADI = "[Yayından önce doldurulacak]";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "Öz & Saye Psikoloji kişisel verilerin korunması (KVKK 6698) aydınlatma metni taslağı.",
  alternates: { canonical: "/kvkk-aydinlatma-metni" },
  robots: { index: false, follow: true },
};

export default function KvkkAydinlatmaMetniPage() {
  return (
    <main id="icerik" className="relative min-h-screen bg-cream py-24 lg:py-32">
      <article className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Anasayfaya dönüş */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-forest-muted transition-colors hover:text-forest"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Anasayfaya dön
        </Link>

        {/* Taslak uyarı kutusu */}
        <div
          role="note"
          className="mt-8 rounded-2xl border border-forest/20 bg-warm-white px-6 py-5 shadow-[0_1px_12px_rgba(35,71,46,0.06)]"
        >
          <p className="flex items-start gap-3 text-sm leading-relaxed text-forest-muted">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-forest"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            <span>
              <strong className="font-semibold text-forest">
                TASLAK
              </strong>{" "}
              &mdash; Bu metin bir taslaktır. Yayından önce bir hukuk
              danışmanının onayı ve{" "}
              <strong className="font-semibold text-forest">[DOLDUR]</strong>{" "}
              olarak işaretli tüm alanların doldurulması gerekir.
            </span>
          </p>
        </div>

        {/* Başlık */}
        <header className="mt-12">
          <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
            Kişisel Verilerin Korunması
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            KVKK <span className="font-medium italic">Aydınlatma Metni</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-forest-muted">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;)
            kapsamında, kişisel verilerinizin işlenmesine ilişkin olarak veri
            sorumlusu sıfatıyla sizi bilgilendirmek isteriz.
          </p>
        </header>

        {/* Sage gradient ayraç */}
        <div className="mx-auto my-12 h-px w-12 bg-sage/40" />

        <div className="space-y-12">
          {/* 1 — Veri Sorumlusunun Kimliği */}
          <section aria-labelledby="veri-sorumlusu">
            <h2
              id="veri-sorumlusu"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              1. Veri Sorumlusunun Kimliği
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              KVKK uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla
              aşağıda kimliği belirtilen tarafından işlenmektedir:
            </p>
            <dl className="mt-5 space-y-3 rounded-xl border border-cream-dark bg-warm-white px-6 py-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-sm font-semibold text-forest sm:w-40">
                  Unvan
                </dt>
                <dd className="text-sm text-forest-muted">
                  {isReady(site.legalName) ? site.legalName : HENUZ_DOLDURULMADI}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-sm font-semibold text-forest sm:w-40">
                  Adres
                </dt>
                <dd className="text-sm text-forest-muted">
                  {isReady(site.address.full)
                    ? site.address.full
                    : HENUZ_DOLDURULMADI}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-sm font-semibold text-forest sm:w-40">
                  Telefon
                </dt>
                <dd className="text-sm text-forest-muted">
                  {isReady(site.phone.display)
                    ? site.phone.display
                    : HENUZ_DOLDURULMADI}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                <dt className="shrink-0 text-sm font-semibold text-forest sm:w-40">
                  E-posta
                </dt>
                <dd className="text-sm text-forest-muted">
                  {isReady(site.email.address)
                    ? site.email.address
                    : HENUZ_DOLDURULMADI}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-forest-muted">
              Bu metinde &ldquo;biz&rdquo;, &ldquo;merkezimiz&rdquo; veya
              &ldquo;veri sorumlusu&rdquo; ifadeleri yukarıda kimliği belirtilen
              tüzel/gerçek kişiyi ifade eder.
            </p>
          </section>

          {/* 2 — İşlenen Kişisel Veriler */}
          <section aria-labelledby="islenen-veriler">
            <h2
              id="islenen-veriler"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              2. İşlenen Kişisel Veriler
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Sizinle kurduğumuz ilişki kapsamında, başta randevu formu olmak
              üzere çeşitli kanallardan aşağıdaki kişisel verileriniz
              işlenebilmektedir:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                {
                  baslik: "Kimlik bilgileri",
                  aciklama: "Ad, soyad.",
                },
                {
                  baslik: "İletişim bilgileri",
                  aciklama: "Telefon numarası, e-posta adresi.",
                },
                {
                  baslik: "Randevu/talep bilgileri",
                  aciklama:
                    "Randevu formunda paylaştığınız mesaj, tercih edilen tarih/saat ve görüşme nedenine ilişkin beyanlarınız.",
                },
              ].map((item) => (
                <li key={item.baslik} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-forest-muted">
                    <strong className="font-semibold text-forest">
                      {item.baslik}:
                    </strong>{" "}
                    {item.aciklama}
                  </span>
                </li>
              ))}
            </ul>

            {/* Özel nitelikli veri uyarısı */}
            <div
              role="note"
              className="mt-6 rounded-xl border-l-4 border-forest bg-sage/10 px-5 py-4"
            >
              <p className="text-sm leading-relaxed text-forest-muted">
                <strong className="font-semibold text-forest">
                  Özel nitelikli kişisel veri uyarısı:
                </strong>{" "}
                Psikolojik destek sürecinde paylaşacağınız bilgiler, ruh sağlığı
                ve psikolojik durumunuza ilişkin{" "}
                <strong className="font-semibold text-forest">
                  sağlık verisi
                </strong>{" "}
                niteliği taşıyabilir. Sağlık verileri, KVKK&apos;nın 6.
                maddesinde &ldquo;özel nitelikli kişisel veri&rdquo; olarak
                tanımlanır ve daha üst düzeyde korunur. Randevu formuna sağlık
                durumunuza ilişkin ayrıntılı bilgi girmemeniz; bu tür bilgileri
                görüşme sırasında uzmanınızla paylaşmanız önerilir.
              </p>
            </div>
          </section>

          {/* 3 — İşleme Amaçları */}
          <section aria-labelledby="isleme-amaclari">
            <h2
              id="isleme-amaclari"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              3. Kişisel Verilerin İşlenme Amaçları
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Randevu talebinizin alınması, değerlendirilmesi ve sizinle iletişime geçilmesi.",
                "Psikolojik danışmanlık ve terapi hizmetlerinin planlanması ve sunulması.",
                "Hizmet kalitesinin geliştirilmesi ve taleplerinizin yönetilmesi.",
                "İlgili mevzuattan doğan yükümlülüklerin yerine getirilmesi.",
              ].map((amac) => (
                <li key={amac} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-forest-muted">
                    {amac}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4 — Hukuki Sebep */}
          <section aria-labelledby="hukuki-sebep">
            <h2
              id="hukuki-sebep"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              4. İşlemenin Hukuki Sebebi
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Kimlik ve iletişim verileriniz, bir sözleşmenin (hizmet
              ilişkisinin) kurulması veya ifası ile veri sorumlusunun meşru
              menfaati gibi KVKK&apos;nın 5. maddesinde sayılan hukuki sebeplere
              dayanılarak işlenir.
            </p>
            <div
              role="note"
              className="mt-5 rounded-xl border-l-4 border-forest bg-sage/10 px-5 py-4"
            >
              <p className="text-sm leading-relaxed text-forest-muted">
                <strong className="font-semibold text-forest">
                  Açık rıza:
                </strong>{" "}
                Sağlık verisi gibi özel nitelikli kişisel verileriniz, KVKK&apos;nın
                6. maddesi uyarınca kural olarak yalnızca{" "}
                <strong className="font-semibold text-forest">açık rızanız</strong>{" "}
                ile işlenir. Açık rızanızı dilediğiniz zaman geri alma hakkına
                sahipsiniz; geri alma, geri alma tarihine kadar yapılmış işlemleri
                etkilemez.
              </p>
            </div>
          </section>

          {/* 5 — Aktarım */}
          <section aria-labelledby="aktarim">
            <h2
              id="aktarim"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              5. Kişisel Verilerin Aktarılması
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi
              için gerekli olduğu ölçüde ve KVKK&apos;nın 8. ve 9. maddelerindeki
              şartlara uygun olarak aşağıdaki alıcı gruplarına aktarılabilir:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                {
                  baslik: "E-posta hizmet sağlayıcıları",
                  aciklama:
                    "Randevu formu bildirimlerinin iletilmesi için kullanılan e-posta servis sağlayıcısı.",
                },
                {
                  baslik: "Barındırma (hosting) hizmet sağlayıcıları",
                  aciklama:
                    "Sitenin ve form verilerinin barındırıldığı altyapı/hosting hizmeti sağlayıcısı.",
                },
                {
                  baslik: "Yetkili kamu kurum ve kuruluşları",
                  aciklama:
                    "Yalnızca yasal yükümlülük gerektirdiğinde ve mevzuatın izin verdiği ölçüde.",
                },
              ].map((item) => (
                <li key={item.baslik} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage"
                    aria-hidden="true"
                  />
                  <span className="text-base leading-relaxed text-forest-muted">
                    <strong className="font-semibold text-forest">
                      {item.baslik}:
                    </strong>{" "}
                    {item.aciklama}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-forest-muted">
              Hizmet sağlayıcıların yurt dışında bulunması hâlinde, yurt dışına
              veri aktarımı yalnızca KVKK&apos;nın 9. maddesindeki şartların
              sağlanması koşuluyla gerçekleştirilir.
            </p>
          </section>

          {/* 6 — Saklama Süresi */}
          <section aria-labelledby="saklama-suresi">
            <h2
              id="saklama-suresi"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              6. Kişisel Verilerin Saklanma Süresi
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Kişisel verileriniz, işlendikleri amaç için gerekli olan süre
              boyunca ve ilgili mevzuatta öngörülen saklama sürelerine uygun
              olarak muhafaza edilir. Sürelerin sona ermesinin ardından
              verileriniz silinir, yok edilir veya anonim hâle getirilir.
            </p>
            <div
              role="note"
              className="mt-5 rounded-xl border border-cream-dark bg-warm-white px-5 py-4"
            >
              <p className="text-sm leading-relaxed text-forest-muted">
                <strong className="font-semibold text-forest">[DOLDUR]</strong>{" "}
                Somut saklama süreleri (örneğin randevu formu verileri için X ay,
                hizmet ilişkisi kapsamındaki kayıtlar için ilgili mevzuatta
                öngörülen süre) hukuk danışmanı ile birlikte belirlenip buraya
                yazılmalıdır.
              </p>
            </div>
          </section>

          {/* 7 — İlgili Kişinin Hakları */}
          <section aria-labelledby="ilgili-kisi-haklari">
            <h2
              id="ilgili-kisi-haklari"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              7. İlgili Kişi Olarak Haklarınız
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              KVKK&apos;nın 11. maddesi uyarınca, veri sorumlusuna başvurarak
              kendinizle ilgili olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="mt-5 space-y-3">
              {[
                "Kişisel verilerinizin işlenip işlenmediğini öğrenme.",
                "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme.",
                "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme.",
                "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme.",
                "Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme.",
                "KVKK ve ilgili diğer mevzuatta öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme.",
                "Düzeltme, silme veya yok etme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
                "İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.",
                "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
              ].map((hak, index) => (
                <li key={hak} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/20 text-xs font-semibold text-forest"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="text-base leading-relaxed text-forest-muted">
                    {hak}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 8 — Başvuru Yöntemi */}
          <section aria-labelledby="basvuru-yontemi">
            <h2
              id="basvuru-yontemi"
              className="font-display text-2xl font-medium text-forest lg:text-3xl"
            >
              8. Başvuru Yöntemi
            </h2>
            <p className="mt-4 text-base leading-relaxed text-forest-muted">
              Yukarıda sayılan haklarınıza ilişkin taleplerinizi, kimliğinizi
              tevsik edici bilgilerle birlikte aşağıdaki e-posta adresine
              ileterek bize iletebilirsiniz. Başvurularınız, KVKK ve ilgili
              mevzuatta öngörülen süreler içinde sonuçlandırılır.
            </p>
            <div className="mt-5 rounded-xl border border-cream-dark bg-warm-white px-6 py-5">
              <p className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-3">
                <span className="font-semibold text-forest">E-posta</span>
                {isReady(site.email.address) ? (
                  <a
                    href={site.email.href}
                    className="font-medium text-forest underline decoration-sage decoration-2 underline-offset-4 transition-colors hover:text-forest-light"
                  >
                    {site.email.address}
                  </a>
                ) : (
                  <span className="font-medium text-forest-muted">
                    {HENUZ_DOLDURULMADI}
                  </span>
                )}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-forest-muted">
                Başvurunuzda adınız, soyadınız ve talebinizin konusunu açıkça
                belirtmeniz, başvurunuzun daha hızlı sonuçlandırılmasına yardımcı
                olur.
              </p>
            </div>
          </section>
        </div>

        {/* Alt taslak hatırlatması */}
        <div className="mx-auto my-12 h-px w-12 bg-sage/40" />
        <p className="text-center text-xs leading-relaxed text-forest-muted">
          Bu aydınlatma metni bir <strong className="font-semibold">taslaktır</strong>{" "}
          ve hukuki tavsiye niteliği taşımaz. Yayımlanmadan önce mutlaka bir hukuk
          danışmanı tarafından gözden geçirilmeli ve onaylanmalıdır.
        </p>
      </article>
    </main>
  );
}
