import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ServiceIcon } from "@/components/ServiceIcon";

export const metadata: Metadata = { title: "Yardım" };

/** Açılır-kapanır yardım kartı: native <details> (JS'siz, erişilebilir). */
function YardimKarti({
  ikon,
  baslik,
  children,
}: {
  ikon: string;
  baslik: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg border border-stone bg-warm-white">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <ServiceIcon name={ikon} className="h-5 w-5 shrink-0 text-sage" />
        <span className="font-medium text-forest">{baslik}</span>
      </summary>
      <div className="space-y-3 border-t border-stone px-5 py-4 text-forest-muted text-sm leading-relaxed">
        {children}
      </div>
    </details>
  );
}

export default function YardimSayfasi() {
  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-forest">Yardım</h1>
        <p className="mt-1 text-forest-muted">
          Panelin tüm özellikleri aşağıda anlatılıyor — bir başlığa dokunarak
          açabilirsiniz.
        </p>
      </div>

      <div className="space-y-4">
        <YardimKarti ikon="user" baslik="Panele giriş nasıl çalışır?">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Şifre yoktur. <strong>/panel/giris</strong>&apos;te e-posta
              adresinizi yazın; adresinize tek kullanımlık bir giriş bağlantısı
              gelir. Bağlantı <strong>15 dakika</strong> geçerlidir ve{" "}
              <strong>bir kez</strong> kullanılabilir.
            </li>
            <li>
              Bağlantı gelmediyse: spam / gereksiz klasörünüzü kontrol edin,
              birkaç dakika bekleyip yeniden isteyin.
            </li>
            <li>
              Giriş yaptıktan sonra oturumunuz uzun süre açık kalır — her
              seferinde yeni bağlantı istemeniz gerekmez.
            </li>
          </ul>
        </YardimKarti>

        <YardimKarti ikon="calendar" baslik="Randevu talepleri">
          <p>
            Siteden gelen her randevu talebi &quot;Talepler&quot;e düşer; ayrıca
            e-posta bildirimi alırsınız. Hastaya da başvurusunun alındığına dair
            otomatik bir e-posta gider.
          </p>
          <p>
            Durumlar: <strong>Yeni</strong> (henüz dönüş yapılmadı) →{" "}
            <strong>Arandı</strong> (hastayla görüşüldü) →{" "}
            <strong>Planlandı</strong> (randevu tarihi belirlendi) →{" "}
            <strong>Tamamlandı</strong>. Uygun olmayanlar için{" "}
            <strong>İptal</strong>.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Talep detayında tek dokunuşla &quot;Arandı olarak işaretle&quot;
              ve &quot;İptal et&quot; düğmeleri vardır; &quot;Planlandı&quot;
              için Yönet bölümünden tarih seçmeniz gerekir.
            </li>
            <li>
              <strong>Önemli:</strong> Planlanan tarihi kaydettiğinizde hastaya
              otomatik bilgilendirme e-postası gider (tarihi değiştirirseniz
              yeni tarihle tekrar gider). Yalnızca iç not düzenlemek e-posta
              göndermez.
            </li>
            <li>
              <strong>İç not</strong> yalnızca panele giren ekip üyelerine
              görünür — hasta asla görmez.
            </li>
            <li>
              Ara / WhatsApp / E-posta düğmeleri hastanın iletişim bilgileriyle
              tek dokunuşta açılır.
            </li>
            <li>
              &quot;Takvim görünümü&quot;nü açarak planlanmış randevularınızı ay
              üzerinde görebilirsiniz; üstteki oklarla ay değiştirilir.
            </li>
          </ul>
        </YardimKarti>

        <YardimKarti ikon="document" baslik="Blog yazısı yazmak">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              &quot;Blog&quot; → &quot;Yeni Yazı&quot;: başlık yazınca adres
              (URL) kendiliğinden oluşur; kategori / etiket / özet doldurun,
              içeriği zengin metin düzenleyicide yazın (kalın, başlık, liste,
              alıntı, bağlantı, görsel ekleme).
            </li>
            <li>
              <strong>&quot;Taslak olarak kaydet&quot;</strong> sitede
              yayımlamaz — dilediğiniz kadar üzerinde çalışabilirsiniz. Hazır
              olunca yazının düzenleme sayfasından <strong>Yayınla</strong>
              &apos;yı kullanın; yazı sitede <strong>anında</strong> görünür.
              Yayından kaldırmak da aynı yerden mümkündür.
            </li>
            <li>
              Yazı listesindeki kapak görselleri şimdilik bizim tarafımızdan
              ekleniyor; yeni yazınıza kapak isterseniz bize iletmeniz
              yeterlidir.
            </li>
          </ul>
        </YardimKarti>

        <YardimKarti ikon="user" baslik="Profilim — sitedeki tanıtım sayfanız">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              &quot;Profilim&quot;de yazdıklarınız, sitedeki{" "}
              <strong>Ekip</strong> sayfanızda ve uzman tanıtım sayfanızda
              yayımlanır; kaydettiğiniz anda site güncellenir. Boş bıraktığınız
              alanlar sitede hiç görünmez.
            </li>
            <li>
              Diplomalar / Sertifikalar / Çalışma alanları kutularında{" "}
              <strong>her satıra bir madde</strong> yazın (virgül değil, alt
              satır).
            </li>
            <li>
              Fotoğraf: PNG, JPEG veya WebP; en fazla <strong>4 MB</strong>.
              Yüklediğiniz anda sitede görünür; &quot;Fotoğrafı kaldır&quot; ile
              eski görünüme dönersiniz.
            </li>
            <li>
              Herkes yalnızca kendi profilini düzenler (info@ hesabı her ikisini
              de düzenleyebilir).
            </li>
          </ul>
        </YardimKarti>

        <YardimKarti ikon="check" baslik="Sık karşılaşılan durumlar">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Giriş bağlantısı gelmedi:</strong> spam klasörünüze bakın,
              birkaç dakika bekleyip yeniden isteyin. Hâlâ yoksa bize yazın.
            </li>
            <li>
              <strong>Bir talebi yanlışlıkla iptal ettim:</strong> talep
              detayındaki Yönet bölümünden durumu tekrar doğru değere
              çevirebilirsiniz — hiçbir şey silinmez.
            </li>
            <li>
              <strong>Fotoğraf yüklenmiyor:</strong> dosya 4 MB&apos;tan büyük
              ya da PNG / JPEG / WebP dışında olabilir; telefonla çekilmiş
              fotoğraflarda &quot;küçük boyut&quot; seçeneğini deneyin.
            </li>
            <li>
              <strong>Kaydettim ama sitede göremiyorum:</strong> birkaç saniye
              bekleyip site sayfasını yenileyin.
            </li>
          </ul>
        </YardimKarti>

        <YardimKarti ikon="heart" baslik="Destek">
          <p>
            Çözemediğiniz her konuda Ömer&apos;e WhatsApp&apos;tan
            yazabilirsiniz — ekran görüntüsü eklerseniz daha hızlı yardımcı
            olur.
          </p>
        </YardimKarti>
      </div>
    </section>
  );
}
