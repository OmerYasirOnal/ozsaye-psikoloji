import type { Metadata } from "next";
import Link from "next/link";

import { isReady, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  // TODO: GERÇEK VERİ -- politika hukuk onayından geçince bu açıklamayı gözden geçirin
  description:
    "Öz & Saye Psikoloji web sitesi gizlilik politikası taslağı: hangi verileri topladığımız, nasıl kullandığımız ve haklarınız.",
  // Taslak/onaysız belge: arama motorlarınca dizine eklenmesin.
  robots: { index: false, follow: true },
};

/** Politikanın son güncellenme tarihi placeholder'ı. */
// TODO: GERÇEK VERİ -- hukuk onayı sonrası gerçek yürürlük tarihini girin (ör. "1 Haziran 2026")
const lastUpdated = "[DOLDUR] Yürürlük tarihi";

/** E-posta gerçek veri mi (placeholder değil mi) — gösterimi buna göre uyarla. */
const emailReady = isReady(site.email.address);

export default function GizlilikPolitikasiPage() {
  return (
    <main id="icerik" className="relative bg-cream">
      {/* Üst ince sage ayraç */}
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-sage/40" />

      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8 lg:py-32">
        {/* Başlık bloğu */}
        <header className="text-center">
          <p className="text-xs font-semibold tracking-widest text-forest uppercase">
            Yasal
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            Gizlilik <span className="font-medium italic">Politikası</span>
          </h1>
          <p className="mt-4 text-sm text-forest-muted">
            Son güncelleme: {lastUpdated}
          </p>
        </header>

        {/* Taslak uyarı kutusu */}
        <div
          role="note"
          className="mt-12 rounded-2xl border border-sage/30 bg-warm-white p-6 lg:p-8"
        >
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/15 text-forest"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-medium italic text-forest">
                Bu metin bir <span className="not-italic font-semibold">taslaktır</span>.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-forest-muted">
                Yayına alınmadan önce hukuki onaydan geçirilmeli ve{" "}
                <span className="font-semibold">[DOLDUR]</span> işaretli tüm
                alanlar (işletme kimliği, iletişim bilgileri, kullanılan
                hizmetler ve yürürlük tarihi) gerçek verilerle doldurulmalıdır.
                Aşağıdaki içerik bağlayıcı bir hukuki belge değildir.
              </p>
            </div>
          </div>
        </div>

        {/* İçerik metni — marka prose tipografisi */}
        <article className="mt-16 space-y-12 text-forest-muted">
          <p className="text-base leading-relaxed">
            Öz & Saye Psikoloji olarak gizliliğinize değer veriyoruz. Bu politika,
            bu web sitesini ziyaret ettiğinizde veya randevu formumuzu
            kullandığınızda kişisel verilerinizin nasıl toplandığını,
            kullanıldığını ve korunduğunu açıklar.
          </p>

          <Section
            id="toplanan-veriler"
            title="Hangi Verileri Topluyoruz"
          >
            <p>
              Randevu talep formumuzu doldurduğunuzda yalnızca sizinle iletişim
              kurabilmek ve talebinizi değerlendirebilmek için gerekli olan
              bilgileri toplarız:
            </p>
            <List
              items={[
                "Ad ve soyad",
                "Telefon numarası",
                "E-posta adresi",
                "Form içinde bize ilettiğiniz mesaj / talep metni",
              ]}
            />
            <p>
              Lütfen randevu formuna tanı, ilaç kullanımı gibi özel nitelikli
              sağlık verilerinizi yazmayınız; bu tür hassas konuları görüşmemiz
              sırasında, güvenli ortamda paylaşmanızı rica ederiz.
            </p>
          </Section>

          <Section
            id="kullanim-amaclari"
            title="Verileri Hangi Amaçla Kullanıyoruz"
          >
            <p>Topladığımız bilgileri yalnızca şu amaçlarla kullanırız:</p>
            <List
              items={[
                "Randevu talebinize geri dönüş yapmak ve görüşme planlamak",
                "Sorularınızı yanıtlamak ve sizi süreç hakkında bilgilendirmek",
                "Yasal yükümlülüklerimizi yerine getirmek",
              ]}
            />
            <p>
              Verilerinizi pazarlama amacıyla satmaz, kiralamaz veya açık
              rızanız olmadan üçüncü taraflarla paylaşmayız.
            </p>
          </Section>

          <Section id="cerezler" title="Çerezler ve Analitik">
            <p>
              {/* TODO: GERÇEK VERİ -- analitik aracı (ör. Vercel Analytics / Google Analytics) entegre edilince bu paragrafı güncelleyin; entegre edilmezse bu bölümü sadeleştirin */}
              Site, temel işlevsellik için zorunlu çerezler kullanabilir.
              İleride ziyaret istatistiklerini anlamak amacıyla{" "}
              <span className="font-semibold">[DOLDUR] analitik aracı</span>{" "}
              eklenirse, bu araç anonim veya takma adlı kullanım verileri
              toplayabilir. Tarayıcı ayarlarınızdan çerezleri her zaman
              reddedebilir veya silebilirsiniz.
            </p>
          </Section>

          <Section
            id="ucuncu-taraflar"
            title="Verileri Paylaştığımız Üçüncü Taraflar"
          >
            <p>
              Hizmetimizi sağlayabilmek için sınırlı sayıda güvenilir altyapı
              sağlayıcısından yararlanırız. Bu sağlayıcılar verilerinizi yalnızca
              bizim adımıza ve talimatlarımız doğrultusunda işler:
            </p>
            <List
              items={[
                // TODO: GERÇEK VERİ -- kullanılan e-posta sağlayıcısını kesinleştirip "ör." ifadesini netleştirin
                "E-posta gönderimi: Form bildirimlerini iletmek için bir e-posta servis sağlayıcısı (ör. Resend) kullanılabilir.",
                // TODO: GERÇEK VERİ -- barındırma sağlayıcısını kesinleştirin
                "Barındırma (hosting): Site ve form altyapısı bir bulut barındırma sağlayıcısında (ör. Vercel) barındırılabilir.",
              ]}
            />
            <p>
              {/* TODO: GERÇEK VERİ -- başka bir e-posta/hosting/analitik sağlayıcı kullanılırsa listeyi güncelleyin */}
              Yukarıdaki sağlayıcıların kendi gizlilik politikaları geçerlidir.
              Bunlar dışında bir hizmet sağlayıcı eklenirse bu bölüm
              güncellenecektir.
            </p>
          </Section>

          <Section id="veri-guvenligi" title="Veri Güvenliği">
            <p>
              Kişisel verilerinizi yetkisiz erişime, kayba veya kötüye kullanıma
              karşı korumak için makul teknik ve idari önlemler alırız. Verilerin
              iletimi şifreli bağlantılar (HTTPS) üzerinden gerçekleşir. Bununla
              birlikte, internet üzerinden yapılan hiçbir aktarımın yüzde yüz
              güvenli olduğunu garanti edemeyeceğimizi hatırlatırız.
            </p>
          </Section>

          <Section id="saklama-suresi" title="Verilerin Saklanması">
            <p>
              {/* TODO: GERÇEK VERİ -- gerçek saklama süresini ve dayanağını hukuk onayı ile netleştirin (ör. "talebiniz sonuçlandıktan sonra en fazla 12 ay") */}
              Verilerinizi yalnızca toplanma amacının gerektirdiği süre boyunca
              veya yasal saklama yükümlülükleri kapsamında{" "}
              <span className="font-semibold">[DOLDUR] saklama süresi</span>{" "}
              boyunca saklarız. Sürenin sonunda verileriniz güvenli biçimde
              silinir veya anonim hâle getirilir.
            </p>
          </Section>

          <Section id="haklariniz" title="Haklarınız">
            <p>
              Yürürlükteki veri koruma mevzuatı (KVKK) kapsamında aşağıdaki
              haklara sahipsiniz:
            </p>
            <List
              items={[
                "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve bunlara erişme",
                "Yanlış veya eksik verilerin düzeltilmesini isteme",
                "Verilerinizin silinmesini veya yok edilmesini talep etme",
                "Verilerinizin işlenmesine yönelik rızanızı geri çekme",
              ]}
            />
            <p>
              Bu haklarınızı kullanmak için aşağıdaki iletişim kanalından bize
              ulaşabilirsiniz.
            </p>
          </Section>

          <Section id="iletisim" title="İletişim">
            <p>
              Bu gizlilik politikası veya verilerinizle ilgili sorularınız için
              bizimle iletişime geçebilirsiniz:
            </p>
            {emailReady ? (
              <p>
                E-posta:{" "}
                <a
                  href={site.email.href}
                  className="font-semibold text-forest underline decoration-sage/50 underline-offset-4 transition-colors hover:decoration-forest"
                >
                  {site.email.address}
                </a>
              </p>
            ) : (
              <p>
                {/* TODO: GERÇEK VERİ -- site.email gerçek adresle doldurulunca bu placeholder otomatik gerçek bağlantıya döner */}
                E-posta:{" "}
                <span className="font-semibold text-forest">
                  {site.email.address}
                </span>
              </p>
            )}
          </Section>
        </article>

        {/* Anasayfaya dönüş */}
        <div className="mt-16 border-t border-sage/20 pt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-forest-light"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Anasayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}

/** Bölüm başlığı + içerik sarmalayıcısı (erişilebilir h2, ince sage ayraç). */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-baslik`} className="scroll-mt-24">
      <h2
        id={`${id}-baslik`}
        className="font-display text-2xl font-light text-forest lg:text-3xl"
      >
        {title}
      </h2>
      <div className="mt-3 h-px w-12 bg-sage/40" />
      <div className="mt-5 space-y-4 text-base leading-relaxed [&_p]:text-forest-muted">
        {children}
      </div>
    </section>
  );
}

/** Marka tarzı liste (sage işaretçili). */
function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
