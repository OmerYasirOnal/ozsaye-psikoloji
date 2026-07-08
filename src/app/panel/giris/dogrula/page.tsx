import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Girişi Tamamla",
  robots: { index: false, follow: false },
};

// Ara onay adımı: GET token'ı TÜKETMEZ. E-posta güvenlik tarayıcıları
// (Outlook SafeLinks, GoDaddy mail taraması) bağlantıları GET ile önceden
// getirir; token'ı burada tüketirsek gerçek kullanıcı tıklamadan yanar.
// Bu sayfa yalnız bir form gösterir — token ancak kullanıcı düğmeye basınca
// (POST) tüketilir. Sayfa VERİTABANINA DOKUNMAZ.
export default async function DogrulaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;
  if (!value) {
    redirect("/panel/giris?hata=1");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-28">
      <h1 className="font-display text-3xl text-forest mb-8">Girişi tamamla</h1>
      <p className="text-forest-muted mb-6">
        Panele giriş yapmak için aşağıdaki düğmeye basın.
      </p>
      {/* trailingSlash:true olduğundan kanonik (sonu /) URL'e POST — 308 yeniden
          gönderim sıçraması olmadan doğrudan 303 döner. */}
      <form method="POST" action="/panel/giris/dogrula/onayla/">
        <input type="hidden" name="token" value={value} />
        <button
          type="submit"
          className="rounded-md bg-forest px-4 py-3 text-warm-white"
        >
          Girişi tamamla
        </button>
      </form>
    </main>
  );
}
