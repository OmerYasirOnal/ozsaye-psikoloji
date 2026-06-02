// Konu havuzu. Üretici, daha önce kullanılmamış bir konuyu seçer.
// İsterseniz bu listeyi genişletebilir veya kendi konularınızı ekleyebilirsiniz.

export const TOPICS = [
  "Kaygıyı yönetmek için günlük nefes ve topraklanma teknikleri",
  "Tükenmişlik sendromu: belirtileri ve toparlanma yolları",
  "Sağlıklı sınırlar koymak neden zordur ve nasıl başlanır",
  "Öz şefkat: kendine karşı nazik olmanın ruh sağlığına etkisi",
  "Uyku hijyeni ve uykunun duygu düzenlemesindeki rolü",
  "Çift ilişkilerinde sağlıklı iletişim becerileri",
  "Ebeveynlerde duygu düzenleme: çocuğa model olmak",
  "Ergenlerde kimlik gelişimi ve ebeveyn desteği",
  "Erteleme (procrastination) ile başa çıkma stratejileri",
  "Yas süreci ve kayıpla sağlıklı başa çıkma",
  "Sosyal kaygıyı anlamak ve küçük adımlarla aşmak",
  "Mükemmeliyetçilik ve onun gizli maliyetleri",
  "Stresli dönemlerde öz bakım rutinleri oluşturmak",
  "Duyguları bastırmak yerine adlandırmanın gücü",
  "İş-yaşam dengesi kurmanın pratik yolları",
  "Travma sonrası iyileşmede güvenli ilişkilerin rolü",
  "Negatif düşünce döngülerini fark etmek ve dönüştürmek",
  "Yalnızlık hissiyle sağlıklı bir ilişki kurmak",
  "Öz saygı ile öz güven arasındaki fark",
  "Terapiye başlamak: ilk seansta ne beklenir",
];

/** Daha önce kullanılmamış bir konu seç; hepsi kullanıldıysa baştan başla. */
export function pickTopic(usedTopics = []) {
  const used = new Set(usedTopics);
  const fresh = TOPICS.filter((t) => !used.has(t));
  const pool = fresh.length > 0 ? fresh : TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}
