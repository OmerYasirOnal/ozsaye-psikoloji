/**
 * AI asistanına (Mac üzerindeki yerel model) ulaşılamadığında devreye giren
 * anahtar-kelime tabanlı sabit cevaplar. Ziyaretçi hiçbir zaman ham hata
 * görmez — bu fonksiyon her zaman bir metin döndürür.
 */
export function fallbackCevap(mesaj: string): string {
  const m = mesaj.toLocaleLowerCase("tr-TR");

  if (m.includes("ücret") || m.includes("fiyat") || m.includes("ne kadar")) {
    return "Şu anda asistanımıza ulaşılamıyor. Ücret bilgisi için Sıkça Sorulan Sorular bölümüne bakabilir veya bize randevu formundan ulaşabilirsiniz.";
  }

  if (m.includes("randevu") || m.includes("görüşme") || m.includes("başvur")) {
    return "Şu anda asistanımıza ulaşılamıyor. Randevu almak için sayfanın altındaki randevu formunu kullanabilirsiniz.";
  }

  if (m.includes("hizmet") || m.includes("terapi") || m.includes("danışman")) {
    return "Şu anda asistanımıza ulaşılamıyor. Sunduğumuz hizmetleri Hizmetler sayfasında inceleyebilirsiniz.";
  }

  return "Şu anda asistanımıza ulaşılamıyor. Sıkça Sorulan Sorular bölümüne bakabilir ya da randevu formundan bize ulaşabilirsiniz.";
}
