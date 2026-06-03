/**
 * Hizmet (çalışma alanı) içerikleri — tek kaynak.
 *
 * İÇERİK NOTU: Aşağıdaki uzun metinler "yanıt biçimli" genel psikoeğitim
 * TASLAKLARIDIR; yayından önce uzmanlar tarafından gözden geçirilip
 * onaylanmalıdır. Klinik-özel iddialar (deneyim, başarı vb.) içermez.
 *
 * Kullanım: /hizmetler (index) ve /hizmetler/[slug] (detay) sayfaları ile
 * ana sayfadaki Services kartları bu veriden beslenir. `iconKey` değerleri
 * src/components/ServiceIcon.tsx içindeki ikon haritasıyla eşleşir.
 */

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceSection {
  heading: string;
  body: string[];
}

export interface Service {
  slug: string;
  title: string;
  /** Kart/özet için kısa açıklama. */
  shortDesc: string;
  /** ServiceIcon haritasındaki anahtar. */
  iconKey: string;
  /** SEO meta açıklaması (~150-160 karakter). */
  metaDescription: string;
  /** 1-2 paragraflık giriş. */
  intro: string;
  /** "Nedir / kimler için / nasıl ilerler" gibi yanıt biçimli bölümler. */
  sections: ServiceSection[];
  /** Sıkça sorulan sorular (FAQPage JSON-LD için de kullanılır). */
  faq: ServiceFaq[];
}

export const services: Service[] = [
  {
    "slug": "bireysel-psikoterapi",
    "title": "Bireysel Psikoterapi",
    "shortDesc": "Kişisel zorluklar, duygusal sorunlar ve yaşam geçişlerinde birebir terapi desteği.",
    "iconKey": "user",
    "metaDescription": "Bireysel psikoterapi nedir, kimler için uygundur ve süreç nasıl ilerler? Kaygı, duygusal zorluklar ve yaşam geçişlerinde birebir, güvenli terapi desteği.",
    "intro": "Bireysel psikoterapi, sizinle bir ruh sağlığı uzmanının birebir çalıştığı, gizli ve güvenli bir görüşme sürecidir. Burada amaç, yaşadığınız zorlukları yargısız bir alanda anlamak; düşünce, duygu ve davranış örüntülerinizi birlikte fark etmek ve size iyi gelen değişimlere alan açmaktır.\n\nBazen tek bir konuyla, bazen uzun süredir taşıdığınız bir yükle gelirsiniz. Her iki durumda da hızınız ve sınırlarınız esastır; süreç sizin ihtiyaçlarınıza göre, acele edilmeden ilerler.",
    "sections": [
      {
        "heading": "Bireysel psikoterapi nedir?",
        "body": [
          "Bireysel psikoterapi, duygusal ve psikolojik zorluklarla baş etmeniz için bir uzmanla düzenli olarak yürüttüğünüz, konuşmaya dayalı bir destek sürecidir. Görüşmeler genellikle haftalık ve belirli bir süre (çoğunlukla 45-50 dakika) üzerinden planlanır.",
          "Bu süreç bir \"akıl verme\" ya da hazır çözüm sunma değildir. Sizi en iyi tanıyan kişinin yine siz olduğunuz varsayımıyla, kendi iç dünyanızı daha net görmenize ve kendinize uygun yolları keşfetmenize eşlik eder."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Bireysel psikoterapi; kaygı, üzüntü, öfke ya da boşluk hissi gibi yoğun duygularla baş etmekte zorlanan, kendini tıkanmış ya da yalnız hisseden herkes için uygun olabilir.",
          "İlişki zorlukları, iş ve performans kaygısı, özgüven ve kendini ifade etme, kayıp ve yas, yaşam geçişleri (taşınma, ayrılık, ebeveynlik, emeklilik gibi) ya da yalnızca kendinizi daha iyi tanıma isteği bu sürecin gündemleri arasında yer alabilir.",
          "Belirgin bir \"sorunu\" olmayan, ama daha bilinçli ve dengeli bir yaşam arayan kişiler için de psikoterapi anlamlı bir alan sunar. Destek almak için kriz anını beklemek gerekmez."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç genellikle bir ön görüşmeyle başlar. Bu ilk buluşmada sizi buraya getiren konuyu, beklentilerinizi ve geçmişinizi birlikte ele alır; çalışma şeklinizi ve hedeflerinizi netleştirirsiniz.",
          "İlerleyen görüşmelerde duygu ve düşüncelerinizi güvenli bir ortamda paylaşır, fark ettiklerinizi pratiğe dökmenin yollarını birlikte ararsınız. Terapinin temposunu ve süresini ihtiyaçlarınız belirler; bazı konular birkaç görüşmede, bazıları daha uzun bir süreçte ele alınır.",
          "Görüşmelerde paylaştıklarınız mesleki etik ve gizlilik ilkeleri çerçevesinde korunur. Kendinizi ya da bir başkasını güvende hissetmediğiniz, acil destek gerektiren durumlarda lütfen vakit kaybetmeden 112 Acil hattını arayın veya en yakın sağlık kuruluşuna başvurun."
        ]
      }
    ],
    "faq": [
      {
        "q": "Görüşmeler ne sıklıkla ve ne kadar sürer?",
        "a": "Görüşmeler çoğunlukla haftada bir kez ve yaklaşık 45-50 dakika sürer. Sıklık ve toplam süre kişiye ve çalışılan konuya göre değişebilir; bunu uzmanınızla birlikte planlarsınız."
      },
      {
        "q": "Terapide anlattıklarım gizli kalır mı?",
        "a": "Evet. Paylaştıklarınız mesleki etik ve gizlilik ilkeleri kapsamında korunur. Gizliliğin yasal olarak sınırlandığı istisnai durumlar (örneğin kendinize ya da bir başkasına yönelik ciddi bir tehlike) ilk görüşmede sizinle açıkça konuşulur."
      },
      {
        "q": "Terapiye başlamak için ciddi bir sorunum mu olmalı?",
        "a": "Hayır. Belirgin bir tanı ya da kriz olması gerekmez. Kendinizi daha iyi tanımak, baş etme becerilerinizi güçlendirmek veya yalnızca konuşacak güvenli bir alana ihtiyaç duymak da geçerli ve yeterli nedenlerdir."
      },
      {
        "q": "İlk görüşmede ne olur?",
        "a": "İlk görüşme bir tanışma ve değerlendirme buluşmasıdır. Sizi buraya getiren konuyu, beklentilerinizi ve nasıl çalışmak istediğinizi birlikte konuşur, sürecin size uygun olup olmadığını sakince değerlendirirsiniz."
      }
    ]
  },
  {
    "slug": "cift-terapisi",
    "title": "Çift Terapisi",
    "shortDesc": "İlişkilerdeki iletişim sorunları, çatışmalar ve bağlanma problemlerine yönelik terapi.",
    "iconKey": "couple",
    "metaDescription": "Çift terapisi nedir, kimler için uygundur ve süreç nasıl ilerler? İletişim sorunları, çatışmalar ve güven konularında iki kişiye birlikte terapi desteği.",
    "intro": "Çift terapisi, ilişkinizdeki zorlukları birlikte ele almak için ikinizin bir uzmanla aynı görüşmede çalıştığı bir destek sürecidir. Amaç taraf tutmak ya da \"haklıyı\" bulmak değil; aranızdaki iletişimi, anlayışı ve bağı güçlendirebileceğiniz güvenli bir alan oluşturmaktır.\n\nİlişkilerde zaman zaman tıkanmalar, tekrar eden tartışmalar ya da uzaklaşma hissi yaşanması olağandır. Çift terapisi, bu döngüleri birlikte fark etmenize ve yeniden birbirinize yaklaşmanın yollarını aramanıza eşlik eder.",
    "sections": [
      {
        "heading": "Çift terapisi nedir?",
        "body": [
          "Çift terapisi, partnerlerin birlikte katıldığı, ilişkideki örüntüleri ve ihtiyaçları anlamaya yönelik bir görüşme sürecidir. Uzman, ikinizin de kendini güvende ve duyulmuş hissedebileceği dengeli bir ortam kurar.",
          "Bu süreçte aranızdaki iletişim biçimleri, tekrar eden çatışmalar ve karşılanmayan ihtiyaçlar birlikte ele alınır. Hedef, ilişkinizi suçlamadan, daha açık ve anlayışlı bir zeminde yeniden konuşabilmenizdir."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Çift terapisi; sık tartışan, birbirini anlamakta zorlanan, iletişimi tıkanmış ya da aralarında bir uzaklaşma hisseden çiftler için uygun olabilir. Evli olmak ya da uzun süreli bir ilişki gerekmez; her aşamadaki çiftler başvurabilir.",
          "Güven sarsılması, geçiş dönemleri (birlikte yaşamaya başlama, ebeveynlik, taşınma gibi), tekrarlayan çatışmalar veya duygusal kopukluk gibi konular bu sürecin gündemleri arasında yer alabilir.",
          "İlişkisini güçlendirmek, birbirini daha iyi anlamak ya da önemli bir karar öncesi birlikte düşünmek isteyen çiftler de çift terapisinden yararlanabilir. Destek almak için ilişkinin krize girmesini beklemek gerekmez."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç genellikle ortak bir ön görüşmeyle başlar. Bu buluşmada ilişkinizin geçmişini, sizi terapiye getiren konuyu ve ikinizin beklentilerini birlikte ele alır; nasıl çalışacağınızı netleştirirsiniz.",
          "İlerleyen görüşmelerde aranızdaki iletişim ve çatışma örüntülerini fark eder, birbirinizi dinlemenin ve ihtiyaçlarınızı ifade etmenin yeni yollarını denersiniz. Uzman zaman zaman bireysel görüşmeler de önerebilir; süre ve tempo ihtiyaçlarınıza göre belirlenir.",
          "Görüşmelerde paylaşılanlar gizlilik ve mesleki etik ilkeleri çerçevesinde korunur. İlişkide şiddet, tehdit ya da güvenliğinizi tehlikeye atan bir durum varsa lütfen vakit kaybetmeden 112 Acil hattını arayın veya yetkili kurumlara başvurun; bu tür durumlarda öncelik güvenliğinizdir."
        ]
      }
    ],
    "faq": [
      {
        "q": "Partnerim gelmek istemiyorsa ne olur?",
        "a": "Çift terapisi ideal olarak iki kişinin katılımıyla yürür. Partneriniz şu an istekli değilse, ilişkinizi nasıl deneyimlediğinizi anlamak için bireysel görüşmelerle başlamak da bir seçenektir; bunu uzmanınızla birlikte değerlendirebilirsiniz."
      },
      {
        "q": "Terapist taraf tutar mı?",
        "a": "Hayır. Uzmanın rolü taraf tutmak ya da kimin haklı olduğuna karar vermek değildir. İkinizin de kendini güvende ve duyulmuş hissedebileceği dengeli bir alan kurarak ilişkinin bütününe odaklanır."
      },
      {
        "q": "Görüşmeler ne sıklıkla yapılır?",
        "a": "Çift görüşmeleri çoğunlukla iki haftada bir veya haftalık planlanır ve bireysel seanslara göre biraz daha uzun sürebilir. Sıklık ve süre, ilişkinizin ihtiyacına göre uzmanınızla birlikte belirlenir."
      },
      {
        "q": "İlişkiyi sürdürmeye kararsızsak yine de gelebilir miyiz?",
        "a": "Evet. Çift terapisi her zaman ilişkiyi sürdürmeyi hedeflemez; kararsızlık da çalışılabilecek geçerli bir gündemdir. Süreç, ikinizin de düşüncelerini sakince konuşabileceğiniz ve sağlıklı bir karara birlikte yaklaşabileceğiniz bir alan sunar."
      }
    ]
  },
  {
    "slug": "aile-danismanligi",
    "title": "Aile Danışmanlığı",
    "shortDesc": "Aile içi dinamikler, ebeveyn-çocuk ilişkisi ve aile içi iletişim sorunlarında destek.",
    "iconKey": "home",
    "metaDescription": "Aile danışmanlığı nedir, kimler için uygundur ve süreç nasıl ilerler? Aile içi iletişim, çatışma ve ebeveyn-çocuk ilişkisinde destek için Öz & Saye Psikoloji.",
    "intro": "Aile danışmanlığı; aile üyelerinin birbirini daha iyi anlaması, iletişimini güçlendirmesi ve zorlandığı konuları birlikte ele alması için sunulan profesyonel bir destek sürecidir. Görüşmeler, ailenin tamamıyla ya da konuya göre belirli üyelerle yürütülebilir. Amaç kimseyi suçlamak değil; ailenin kendi içindeki örüntüleri fark etmesine ve daha sağlıklı bir denge kurmasına eşlik etmektir.\n\nHer ailenin hikâyesi kendine özgüdür. Bu sayfa genel bilgilendirme amaçlıdır; sizin ailenize uygun yaklaşım, ilk görüşmede birlikte değerlendirilir. Öz & Saye Psikoloji olarak hedefimiz, her üyenin kendini açıkça ifade edebildiği güvenli bir alan sunmaktır.",
    "sections": [
      {
        "heading": "Aile danışmanlığı nedir?",
        "body": [
          "Aile danışmanlığı, aileyi tek tek bireyler yerine birbirini etkileyen bir bütün olarak ele alan bir çalışmadır. Bir üyenin yaşadığı zorluğun çoğu zaman ailenin geneliyle ilişkili olduğu kabul edilir; bu nedenle çözüm de birlikte aranır.",
          "Görüşmelerde uzman, tarafsız bir kolaylaştırıcı rolü üstlenir. Kimin haklı ya da haksız olduğuna karar vermek yerine, ailenin iletişim biçimini, rollerini ve tekrar eden örüntülerini anlamaya ve birlikte yeniden düzenlemeye yardımcı olur."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Aile içinde sık tekrarlayan çatışmalar, iletişimde kopukluk ya da birbirini anlamakta zorlanma yaşayan aileler için uygun olabilir. Ebeveyn-çocuk ilişkisinde gerginlik, ergenlik dönemine eşlik eden zorluklar, kardeşler arası anlaşmazlıklar da sık ele alınan konulardır.",
          "Boşanma, taşınma, kayıp, hastalık ya da aileye yeni bir üyenin katılması gibi geçiş dönemleri de destek almak için anlamlı zamanlardır. Görüşmeye ailenin tüm üyelerinin katılması şart değildir; kimlerin yer alacağı ihtiyaca göre birlikte belirlenir."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç genellikle bir tanışma ve değerlendirme görüşmesiyle başlar. Bu ilk aşamada ailenin gündemindeki konular, beklentiler ve birlikte üzerinde çalışılacak hedefler konuşulur.",
          "Sonraki görüşmelerde iletişim becerileri, sınırlar, roller ve çatışmaların ele alınma biçimi üzerinde çalışılır. Görüşmelerin sıklığı ve toplam süre; ailenin ihtiyacına ve gidişata göre birlikte değerlendirilerek esnek biçimde planlanır.",
          "Görüşmelerde paylaşılanlar gizlilik ilkesi çerçevesinde ele alınır. Amaç, ailenin görüşmeler dışında da kullanabileceği yeni iletişim ve baş etme yollarını birlikte keşfetmektir."
        ]
      }
    ],
    "faq": [
      {
        "q": "Aile danışmanlığına tüm üyelerin katılması gerekir mi?",
        "a": "Hayır. Görüşmeye kimlerin katılacağı, ele alınan konuya ve ailenin ihtiyacına göre belirlenir. Bazı görüşmeler aile bütününüyle, bazıları yalnızca belirli üyelerle yürütülebilir. Bu, ilk görüşmede birlikte planlanır."
      },
      {
        "q": "Danışman taraf tutar mı?",
        "a": "Hayır. Uzmanın rolü kimin haklı olduğuna karar vermek değil, herkesin kendini güvenle ifade edebileceği tarafsız bir alan oluşturmaktır. Amaç, ailenin birbirini daha iyi anlamasına ve ortak çözümler bulmasına eşlik etmektir."
      },
      {
        "q": "Çocuğumuz görüşmelere katılmak istemiyor, ne yapabiliriz?",
        "a": "Bu oldukça doğal bir tepkidir ve zorlamak gerekmez. Süreç, başlangıçta yalnızca ebeveynlerle de yürütülebilir. Çocuğun ya da ergenin katılımı, kendini hazır hissettiğinde ve uygun bir biçimde planlanabilir."
      },
      {
        "q": "Aile danışmanlığı ne kadar sürer?",
        "a": "Sürenin önceden kesin olarak söylenmesi mümkün değildir; her ailenin gündemi ve gidişatı farklıdır. Görüşme sıklığı ve toplam süre, ihtiyaca göre birlikte değerlendirilerek esnek biçimde planlanır."
      }
    ]
  },
  {
    "slug": "cocuk-ergen-terapisi",
    "title": "Çocuk & Ergen Terapisi",
    "shortDesc": "Çocuk ve ergenlerin gelişimsel, duygusal ve davranışsal sorunlarına özel yaklaşım.",
    "iconKey": "child",
    "metaDescription": "Çocuk ve ergen terapisi nedir, kimler için uygundur ve süreç nasıl ilerler? Çocuğunuzun duygusal ve davranışsal zorluklarında destek için Öz & Saye Psikoloji.",
    "intro": "Çocuk ve ergen terapisi; çocukların ve gençlerin yaşadıkları duygusal, davranışsal ya da gelişimsel zorlukları, gelişim dönemlerine uygun yöntemlerle ele alan bir destek sürecidir. Çocuklar duygularını her zaman sözcüklerle anlatamadığı için terapide oyun, çizim ve yaşına uygun etkinliklerden de yararlanılabilir. Ergenlerle ise daha çok konuşmaya dayalı, onların özerkliğine saygılı bir çalışma yürütülür.\n\nBu sayfa genel bir bilgilendirmedir ve tanı niteliği taşımaz. Çocuğunuza ya da gencinize uygun yaklaşım, ilk görüşmede birlikte değerlendirilir. Öz & Saye Psikoloji olarak amacımız, çocuğun kendini güvende hissettiği, yargılanmadan ifade edebildiği bir alan sunmaktır.",
    "sections": [
      {
        "heading": "Çocuk ve ergen terapisi nedir?",
        "body": [
          "Çocuk ve ergen terapisi, gelişim dönemine uygun yöntemlerle yürütülen, çocuğun ya da gencin yaşadığı zorluğu anlamasına ve baş etmesine destek olan bir çalışmadır. Çocuklarla genellikle oyun, hikâye ve yaratıcı etkinlikler aracılığıyla; ergenlerle ise daha çok konuşmaya dayalı görüşmelerle ilerlenir.",
          "Bu süreçte çocuğun davranışları bir bütün olarak ele alınır. Bir davranış çoğu zaman çocuğun anlatamadığı bir ihtiyacın ya da duygunun ifadesidir; terapi bu anlamı birlikte keşfetmeye yardımcı olur."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Kaygı, içe kapanma, uyku ya da yeme düzeninde değişiklik, öfke patlamaları, okula uyum güçlüğü gibi durumlarda destek düşünülebilir. Ergenlerde ise akademik baskı, akran ilişkileri, kimlik arayışı ve aileyle iletişimde zorlanma sık karşılaşılan konulardır.",
          "Boşanma, taşınma, kardeş doğumu, kayıp ya da okul değişikliği gibi geçiş dönemleri de çocuklar için zorlayıcı olabilir. Bu sayfadaki bilgiler tanı koymaz; çocuğunuzdaki değişimleri fark ettiğinizde bir uzmanla görüşmek, durumu birlikte anlamanın güvenli bir yoludur."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç çoğunlukla ebeveynlerle yapılan bir tanışma görüşmesiyle başlar. Bu görüşmede çocuğun gelişim öyküsü, gündemdeki zorluklar ve ailenin gözlemleri konuşulur; birlikte üzerinde çalışılacak hedefler belirlenir.",
          "Çocukla yapılan görüşmeler yaşına ve ihtiyacına göre planlanır. Görüşme sıklığı ve toplam süre, gidişata göre birlikte değerlendirilir. Ebeveynler süreç boyunca uygun aralıklarla bilgilendirilir; bu sayede destek evde de sürdürülebilir.",
          "Çocuğun terapide paylaştıkları, ona güvenli bir alan sunmak adına gizlilik ilkesi çerçevesinde ele alınır. Aileyle paylaşılacak bilgiler ise çocuğun iyiliği gözetilerek ve şeffaf biçimde belirlenir."
        ]
      },
      {
        "heading": "Ebeveyn olarak rolünüz nedir?",
        "body": [
          "Çocuk ve ergen terapisinde ebeveynler sürecin önemli bir parçasıdır. Çocuğun en çok zaman geçirdiği ortam ailedir; bu nedenle evde kurulan iletişim ve tutum, terapinin etkisini doğrudan destekler.",
          "Uzman, gözlemleriniz ve sorularınız için sizinle düzenli iletişim kurar; gerektiğinde evde uygulayabileceğiniz yaklaşımlar üzerine birlikte çalışılır. Çocuğunuzun zorlandığını fark edip destek aramanız, başlı başına onun için değerli bir adımdır."
        ]
      }
    ],
    "faq": [
      {
        "q": "Çocuğum terapiye gitmek istemiyor, zorlamalı mıyım?",
        "a": "Çocuğun isteksizliği doğaldır ve zorlamak yerine süreci yumuşak bir şekilde tanıtmak daha yardımcı olur. İlk görüşmeler ebeveynlerle de yürütülebilir. Çocuğun katılımı, kendini hazır hissedeceği bir biçimde planlanır."
      },
      {
        "q": "Görüşmelerde çocuğumun anlattıkları bana aktarılır mı?",
        "a": "Çocuğun kendini güvende hissetmesi için görüşmeler gizlilik ilkesiyle ele alınır. Bununla birlikte çocuğun iyiliğini ilgilendiren konularda aileyle şeffaf bir paylaşım yapılır. Bu denge, sürecin başında sizinle netleştirilir."
      },
      {
        "q": "Çocuğumun bir sorunu olduğunu nasıl anlarım?",
        "a": "Uyku, iştah, ruh hali, okul ya da arkadaş ilişkilerindeki belirgin ve süreklilik gösteren değişimler dikkate alınabilir. Bu belirtiler tek başına tanı anlamına gelmez; emin olamadığınızda bir uzmanla görüşmek durumu birlikte anlamanıza yardımcı olur."
      },
      {
        "q": "Ergen çocuğumla aramdaki iletişim için de destek alabilir miyiz?",
        "a": "Evet. Ergenlik döneminde iletişimde gerginlik yaşamak yaygındır. Görüşmeler hem gencin kendini ifade etmesine hem de aile içi iletişimin güçlenmesine destek olacak biçimde planlanabilir."
      }
    ]
  },
  {
    "slug": "depresyon-anksiyete",
    "title": "Depresyon & Anksiyete",
    "shortDesc": "Depresyon, kaygı bozuklukları ve panik atak tedavisinde uzman terapi desteği.",
    "iconKey": "check",
    "metaDescription": "Depresyon, kaygı bozuklukları ve panik atakta terapi desteği. Öz & Saye Psikoloji'de güvenli bir alanda, size uygun bir süreçle birlikte yol alın.",
    "intro": "Depresyon ve anksiyete, hayatın bir döneminde pek çok kişinin yaşadığı, yalnız olmadığınız deneyimlerdir. Sürekli bir isteksizlik, tükenmişlik, kontrol edilemez bir kaygı ya da yoğun panik anları yaşamınızı zorlaştırıyorsa, bunlarla baş başa kalmak zorunda değilsiniz.\n\nÖz & Saye Psikoloji'de amacımız, duygularınızı yargılamadan dinleyebileceğiniz güvenli bir alan sunmak ve size uygun adımları birlikte belirlemek. Bu sayfada depresyon ile anksiyetenin ne olduğunu, kimler için destek alma sürecinin uygun olabileceğini ve terapinin nasıl ilerlediğini sade bir dille açıklıyoruz.",
    "sections": [
      {
        "heading": "Depresyon ve anksiyete nedir?",
        "body": [
          "Depresyon; uzun süre devam eden çökkün ruh hali, ilgi ve keyif kaybı, enerji düşüklüğü, uyku ve iştah değişiklikleri gibi belirtilerle kendini gösterebilen bir ruh sağlığı durumudur. Geçici bir üzüntüden farklı olarak günlük yaşamı, işi ve ilişkileri belirgin biçimde etkileyebilir.",
          "Anksiyete ise tehlike algısına karşı bedenin doğal bir tepkisidir; ancak yoğunlaştığında, sürekli hale geldiğinde ya da somut bir nedene bağlı olmadan ortaya çıktığında zorlayıcı olabilir. Yaygın kaygı, panik atak ve belirli durumlara yönelik korkular bu başlık altında değerlendirilebilir.",
          "Bu metin genel bilgilendirme amaçlıdır ve tanı yerine geçmez. Belirtilerinizin sizin için ne anlama geldiğini, bir uzmanla yapılan görüşmede birlikte anlamlandırmak mümkündür."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Kendinizi uzun süredir mutsuz, umutsuz ya da motivasyonsuz hissediyorsanız; eskiden keyif aldığınız şeylere ilginiz azaldıysa ya da yoğun bir kaygı, huzursuzluk veya panik anları yaşıyorsanız destek almayı düşünebilirsiniz.",
          "Uyku düzeninizde, iştahınızda ya da odaklanma becerinizde değişiklikler fark eden, sürekli bir gerginlik hissi taşıyan veya kaygıları nedeniyle bazı durumlardan kaçınmaya başlayan yetişkinler için bu çalışma alanı uygundur. Belirtiler hafif ya da yeni başlamış olsa da destek almak için bir krizi beklemek gerekmez.",
          "Acil bir tehlike hissediyorsanız, kendinize ya da bir başkasına zarar verme düşünceleriniz varsa lütfen vakit kaybetmeden 112 Acil Servis'i arayın veya en yakın acil sağlık kuruluşuna başvurun. Terapi süreci, böyle anlarda alınacak acil yardımın yerine geçmez."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç genellikle bir tanışma görüşmesiyle başlar. Bu ilk görüşmede yaşadıklarınızı, beklentilerinizi ve şu anki ihtiyaçlarınızı paylaşırsınız; uzmanınız da nasıl çalışılabileceğini sizinle birlikte değerlendirir.",
          "Sonraki görüşmelerde, size uygun bir yaklaşımla duygu ve düşüncelerinizi anlamaya, kaygıyla ya da çökkünlükle baş etme becerilerinizi güçlendirmeye ve sizi zorlayan döngüleri fark etmeye çalışırsınız. Tempo sizinle birlikte belirlenir; her adımda söz sahibi olursunuz.",
          "Görüşmelerin sıklığı ve süreci kişiden kişiye değişir. Burada paylaşılan her şey gizlilik ilkesi çerçevesinde korunur ve hiçbir şeyi paylaşmaya zorlanmazsınız."
        ]
      }
    ],
    "faq": [
      {
        "q": "Depresyon ve anksiyete için ne zaman destek almalıyım?",
        "a": "Belirtileriniz birkaç haftadır devam ediyorsa, günlük yaşamınızı, işinizi ya da ilişkilerinizi etkiliyorsa destek almayı düşünebilirsiniz. Destek almak için durumun çok ağırlaşmasını beklemek gerekmez; erken adım atmak süreci kolaylaştırabilir."
      },
      {
        "q": "Panik atak yaşıyorum, bu da bu kapsamda mı?",
        "a": "Evet. Ani başlayan yoğun korku, çarpıntı, nefes darlığı ve kontrolü kaybetme hissiyle gelen panik atak, anksiyete çalışma alanı içinde değerlendirilir. Görüşmelerde panik anlarını anlamaya ve onlarla baş etme becerilerini güçlendirmeye yönelik çalışılabilir."
      },
      {
        "q": "Terapi ne kadar sürer?",
        "a": "Sürenin standart bir cevabı yoktur; ihtiyaçlarınıza, hedeflerinize ve sürecin nasıl ilerlediğine göre değişir. Bunu uzmanınızla birlikte, görüşmeler ilerledikçe değerlendirirsiniz. Size bir garanti ya da kesin süre vaadi sunulmaz."
      },
      {
        "q": "İlk görüşmede her şeyi anlatmak zorunda mıyım?",
        "a": "Hayır. Kendinizi hazır hissettiğiniz kadarını paylaşmanız yeterlidir. Terapi, kendi hızınızda ilerleyen ve güvenin zamanla kurulduğu bir süreçtir; hiçbir konuyu konuşmaya zorlanmazsınız."
      }
    ]
  },
  {
    "slug": "travma-terapisi",
    "title": "Travma Terapisi",
    "shortDesc": "Travmatik yaşantılar, kayıp ve yas süreçlerinde iyileşmeye yönelik terapi.",
    "iconKey": "heart",
    "metaDescription": "Travmatik yaşantılar, kayıp ve yas süreçlerinde iyileşmeye yönelik terapi. Öz & Saye Psikoloji'de güvenli bir alanda kendi hızınızda iyileşin.",
    "intro": "Zorlayıcı bir olay, ani bir kayıp ya da uzun süre etkisi devam eden bir yaşantı, zihninizde ve bedeninizde derin izler bırakabilir. Yaşadıklarınız hâlâ sizi etkiliyorsa, geçmiş bir an bugüne taşınıyorsa ya da bir yas sürecinin içinde kendinizi kaybolmuş hissediyorsanız bu yükü tek başınıza taşımak zorunda değilsiniz.\n\nÖz & Saye Psikoloji'de travma terapisini, acele ettirmeyen, güvenliği önceleyen bir yaklaşımla ele alıyoruz. Bu sayfada travmanın ne olduğunu, kimler için destek almanın uygun olabileceğini ve sürecin nasıl ilerlediğini sade bir dille paylaşıyoruz.",
    "sections": [
      {
        "heading": "Travma terapisi nedir?",
        "body": [
          "Travma, kişinin baş etme kapasitesini zorlayan, kendini güçsüz ya da güvende olmayan hissettiren bir yaşantının ardından ortaya çıkabilen psikolojik etkidir. Bu etki tek bir olaya bağlı olabileceği gibi, uzun süre tekrar eden zorlayıcı deneyimlerle de gelişebilir.",
          "Travmatik yaşantıların ardından geçmişe ait sahnelerin zihne dolması, uyku ve odaklanma güçlükleri, sürekli tetikte olma hissi ya da bazı yer ve durumlardan kaçınma görülebilir. Kayıp ve yas süreçleri de yoğun ve dalgalı duygular barındırabilir.",
          "Travma terapisi, bu deneyimleri güvenli bir ortamda anlamlandırmaya, beden ve zihindeki etkilerini hafifletmeye ve kişinin kendi içindeki güvenlik duygusunu yeniden kurmasına alan açmayı amaçlar. Bu metin genel bilgilendirme amaçlıdır; tanı ya da iyileşme garantisi içermez."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Geçmişte yaşadığınız zorlayıcı bir olayın etkisini hâlâ üzerinizde hissediyorsanız; istemsiz gelen anılar, kâbuslar, irkilme, sürekli tetikte olma ya da bazı hatırlatıcılardan uzak durma gibi tepkiler yaşıyorsanız destek almayı düşünebilirsiniz.",
          "Bir sevdiğinizi kaybettiyseniz ve yas süreciniz uzayıp günlük yaşamınızı zorlaştırıyorsa, ya da yaşadıklarınızı henüz kimseyle paylaşamadığınızı hissediyorsanız bu çalışma alanı sizin için uygun olabilir. Olayın 'yeterince büyük' olup olmadığını sorgulamanıza gerek yok; sizi etkileyen her yaşantı önemlidir.",
          "Kendinize ya da bir başkasına zarar verme düşünceleriniz varsa veya acil bir kriz içindeyseniz lütfen 112 Acil Servis'i arayın ya da en yakın acil sağlık kuruluşuna başvurun. Terapi süreci, acil durumlarda alınması gereken yardımın yerine geçmez."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Travma terapisinde güvenlik ve süreklilik önceliklidir. Bu nedenle süreç, sizi tanımaya ve kendinizi güvende hissedeceğiniz bir zemin kurmaya odaklanan görüşmelerle başlar. Hiçbir şeyi anlatmaya hazır olmadan zorlanmazsınız.",
          "Zaman içinde, hazır hissettiğinizde, zorlayıcı yaşantıyı kendi hızınızda ele almaya, baş etme becerilerinizi güçlendirmeye ve bugünkü yaşamınızla bağınızı sağlamlaştırmaya yönelik çalışılır. Sürecin temposunu siz belirlersiniz.",
          "Görüşmelerin sıklığı ve süresi kişiden kişiye değişir. Paylaştıklarınız gizlilik ilkesi çerçevesinde korunur; iyileşme dalgalı ilerleyebilir ve bu sürecin doğal bir parçasıdır."
        ]
      }
    ],
    "faq": [
      {
        "q": "Yaşadığım şey travma sayılır mı?",
        "a": "Bir yaşantının travma olarak adlandırılması, olayın 'büyüklüğünden' çok sizi nasıl etkilediğiyle ilgilidir. Sizi güçsüz, güvensiz ya da çaresiz hissettiren ve etkisi devam eden bir deneyim önemlidir. Bunu bir görüşmede birlikte anlamlandırabilirsiniz."
      },
      {
        "q": "Yaşadıklarımı detaylı anlatmak zorunda mıyım?",
        "a": "Hayır. Travma terapisinde güvenlik önceliklidir ve hiçbir şeyi hazır hissetmeden paylaşmanız beklenmez. Süreç sizin hızınızda ilerler; ne kadarını, ne zaman paylaşacağınıza siz karar verirsiniz."
      },
      {
        "q": "Yas süreci için de destek alabilir miyim?",
        "a": "Evet. Bir kaybın ardından gelen yoğun ve dalgalı duygular zorlayıcı olabilir. Yas süreci uzadığında ya da günlük yaşamınızı belirgin biçimde etkilediğinde, duygularınıza alan açan bir destek almayı düşünebilirsiniz."
      },
      {
        "q": "Travma terapisi ne kadar sürer?",
        "a": "Sürenin tek bir cevabı yoktur; yaşantınıza, ihtiyaçlarınıza ve sürecin nasıl ilerlediğine göre değişir. İyileşme adım adım ve kimi zaman dalgalı ilerler. Bunu uzmanınızla birlikte değerlendirir, süreçle ilgili bir garanti almazsınız."
      }
    ]
  },
  {
    "slug": "stres-yonetimi",
    "title": "Stres Yönetimi",
    "shortDesc": "İş ve günlük yaşam stresinin yönetimi, tükenmişlik sendromu ve başa çıkma becerileri.",
    "iconKey": "clock",
    "metaDescription": "Stres yönetimi desteğiyle iş ve günlük yaşam baskısını, tükenmişliği ve kaygıyı sağlıklı başa çıkma becerileriyle dengelemeyi öğrenin. Güvenli bir alanda destek alın.",
    "intro": "Stres, yoğun talepler ya da değişim karşısında bedenin ve zihnin doğal bir tepkisidir; belirli ölçüde uyum sağlamaya yardımcı olabilir. Ancak süreklileştiğinde uyku, dikkat, ilişkiler ve genel iyilik hali üzerinde yorucu bir yük oluşturabilir. Burada amaç stresi tümüyle ortadan kaldırmak değil, onu fark etmeyi ve yönetilebilir kılmayı öğrenmektir.\n\nStres yönetimi desteği, yaşadığınız zorluğu sakin ve yargısız bir alanda birlikte anlamaya, üzerinizdeki baskıyı azaltan somut beceriler geliştirmeye yöneliktir. Tek başına taşımak zorunda değilsiniz; bu yolda yanınızda olabiliriz.",
    "sections": [
      {
        "heading": "Stres yönetimi nedir?",
        "body": [
          "Stres yönetimi, gündelik yaşamın baskılarına karşı verdiğiniz tepkileri fark etmeyi, bu tepkileri yatıştırmayı ve zorluklarla daha dengeli başa çıkmayı amaçlayan bir destek sürecidir. Görüşmelerde stresinizin kaynaklarını, bedeninizde ve düşüncelerinizde nasıl belirdiğini ve bugüne kadar geliştirdiğiniz başa çıkma yollarını birlikte ele alırız.",
          "Bu süreç bir hastalığı tedavi etmekten çok, kendi sınırlarınızı tanımanıza ve enerjinizi koruyan sağlıklı alışkanlıklar kurmanıza odaklanır. Nefes ve gevşeme çalışmaları, sınır koyma, önceliklendirme ve düşünce kalıplarını gözden geçirme gibi araçlar sıklıkla bu kapsamda çalışılır."
        ]
      },
      {
        "heading": "Kimler için uygundur?",
        "body": [
          "Uzun süredir yoğun iş temposu, sorumluluk yükü ya da belirsizlik altında olduğunu hisseden; sürekli yorgunluk, gerginlik, sinirlilik veya uykuda bozulma yaşayan kişiler bu destekten yararlanabilir. Tükenmişlik hissi, motivasyon kaybı veya işine karşı duygusal mesafe yaşayanlar için de uygundur.",
          "Sınav, iş değişikliği, taşınma, sağlık sorunu ya da aile içi sorumluluklar gibi geçiş ve zorlanma dönemlerinde de stres yönetimi yardımcı olabilir. Belirtileriniz günlük yaşamınızı, ilişkilerinizi veya işlevselliğinizi belirgin biçimde etkiliyorsa, bir uzmanla konuşmak iyi bir başlangıç olabilir."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç genellikle bir ön görüşmeyle başlar; burada yaşadıklarınızı, stresinizin bağlamını ve ne tür bir destek aradığınızı birlikte konuşuruz. Ardından, sizin için anlamlı ve gerçekçi hedefler belirleriz.",
          "İlerleyen görüşmelerde stresi tetikleyen durumları tanımayı, bedensel gerginliği yatıştıran teknikleri ve günlük yaşama uyarlanabilir başa çıkma stratejilerini adım adım çalışırız. Süreç tek tip değildir; temponuz, ihtiyaçlarınız ve gözlemlediğimiz değişimlere göre birlikte uyarlanır."
        ]
      },
      {
        "heading": "Ne zaman destek almalı?",
        "body": [
          "Stresin geçici ve durumsal olması olağandır. Ancak gerginlik haftalarca sürüyor, uyku ve iştahınızı, dikkatinizi ya da ilişkilerinizi olumsuz etkiliyorsa profesyonel destek almak değerli olabilir. Erken adım atmak, zorluğun birikmesini önlemeye yardımcı olabilir.",
          "Kendinize veya bir başkasına zarar verme düşünceleriniz varsa ya da kendinizi güvende hissetmiyorsanız, lütfen vakit kaybetmeden 112 Acil hattını arayın veya en yakın acil servise başvurun. Bu durumlarda hızlı ve güvenli destek almak önceliklidir."
        ]
      }
    ],
    "faq": [
      {
        "q": "Stres yönetimi ile terapi aynı şey mi?",
        "a": "Tam olarak aynı değildir. Stres yönetimi, gündelik baskılarla başa çıkma becerilerini güçlendirmeye odaklanan, daha çok beceri temelli bir destektir. Yaşadıklarınız daha derin ya da süreğen bir zorluğa işaret ediyorsa, görüşmeler sırasında size uygun başka bir destek biçimi de birlikte değerlendirilebilir."
      },
      {
        "q": "Süreç ne kadar sürer?",
        "a": "Süre kişiden kişiye değişir ve baştan kesin bir takvim vermek doğru olmaz. İhtiyacınıza, hedeflerinize ve birlikte gözlemlediğimiz ilerlemeye göre süreç esnek biçimde şekillenir. Bunu ilk görüşmelerde birlikte konuşur, beklentilerinizi netleştiririz."
      },
      {
        "q": "Tükenmişlik için de başvurabilir miyim?",
        "a": "Evet. Sürekli yorgunluk, motivasyon kaybı, işe veya sorumluluklara karşı duygusal mesafelenme gibi tükenmişlik belirtileri yaşıyorsanız bu desteğe başvurabilirsiniz. Görüşmelerde yükünüzü hafifletecek sınır koyma, dinlenme ve önceliklendirme yollarını birlikte ele alırız."
      },
      {
        "q": "İlk görüşmede ne olur?",
        "a": "İlk görüşme, tanışma ve yaşadıklarınızı sakin bir ortamda paylaşmanız için bir alandır. Stresinizin bağlamını, beklentilerinizi ve birlikte çalışmanın size uygun olup olmadığını değerlendiririz. Her şeyi ilk görüşmede anlatmak zorunda değilsiniz; kendi temponuzda ilerlersiniz."
      }
    ]
  },
  {
    "slug": "kisisel-gelisim",
    "title": "Kişisel Gelişim",
    "shortDesc": "Öz farkındalık, kendini tanıma, özgüven geliştirme ve yaşam hedeflerine ulaşma.",
    "iconKey": "growth",
    "metaDescription": "Kişisel gelişim desteğiyle öz farkındalığınızı artırın, kendinizi daha iyi tanıyın, özgüveninizi güçlendirin ve yaşam hedeflerinize doğru sakin bir alanda ilerleyin.",
    "intro": "Kişisel gelişim, bir sorunu çözmekten çok kendinizi daha derinden tanımaya, güçlü yanlarınızı fark etmeye ve istediğiniz yaşama doğru bilinçli adımlar atmaya yönelik bir yolculuktur. Herkesin bu yolculuğu kendine özgüdür ve burada sizinkine saygıyla, yargısız bir biçimde eşlik etmeyi amaçlarız.\n\nBu destek, bir tanıyı ya da rahatsızlığı gerektirmez. Kendinizi daha iyi anlamak, kararlarınızda daha net hissetmek veya yaşamınıza yeni bir yön vermek istiyorsanız, bu güvenli alanda bunları birlikte keşfedebiliriz.",
    "sections": [
      {
        "heading": "Kişisel gelişim desteği nedir?",
        "body": [
          "Kişisel gelişim desteği, öz farkındalığınızı artırmaya, değerlerinizi ve ihtiyaçlarınızı netleştirmeye ve yaşam hedeflerinize doğru anlamlı adımlar atmanıza yardımcı olan bir süreçtir. Görüşmelerde düşünce, duygu ve davranış kalıplarınızı birlikte gözden geçirir; sizi zorlayan ve sizi taşıyan yanları daha görünür kılarız.",
          "Bu süreç hazır reçeteler sunmaz. Bunun yerine kendi yanıtlarınıza ulaşmanızı destekleyen sorular, alıştırmalar ve düşünme alanları sağlar. Amaç, kendi yaşamınızda daha bilinçli ve özerk tercihler yapabilmenizdir."
        ]
      },
      {
        "heading": "Hangi konularda destek olur?",
        "body": [
          "Kendini tanıma ve öz farkındalık, özgüven ve öz değer, karar verme ve yön bulma, sınır koyma, iletişim ve ilişkilerde denge gibi pek çok başlık bu kapsamda çalışılabilir. Yaşam geçişleri, hedef belirleme ve motivasyon konuları da sıklıkla ele alınır.",
          "Belirgin bir sorun yaşamasanız bile, yalnızca kendinizi daha iyi anlamak veya yaşamınıza dair bir durgunluk hissini açmak için de başvurabilirsiniz. Neyi keşfetmek istediğinize birlikte karar veririz."
        ]
      },
      {
        "heading": "Süreç nasıl ilerler?",
        "body": [
          "Süreç bir tanışma görüşmesiyle başlar; burada nereden geldiğinizi, neyi merak ettiğinizi ve bu yolculuktan ne beklediğinizi birlikte konuşuruz. Ardından sizin için anlamlı odak alanları ve gerçekçi hedefler belirleriz.",
          "İlerleyen görüşmelerde kendinizi gözlemleme, fark ettiklerinizi günlük yaşama taşıma ve adımlarınızı birlikte değerlendirme üzerinden ilerleriz. Tempo ve yön tamamen size aittir; süreç ihtiyaçlarınıza göre esnek biçimde şekillenir."
        ]
      },
      {
        "heading": "Ne zaman başvurabilirsiniz?",
        "body": [
          "Kendinizi daha iyi tanımak, bir kararda netleşmek, özgüveninizi güçlendirmek ya da yaşamınıza yeni bir yön vermek istediğiniz herhangi bir dönemde başvurabilirsiniz. Bir kriz ya da rahatsızlık beklemeden, kendi gelişiminize alan açmak için de bu desteği seçebilirsiniz.",
          "Eğer yaşadıklarınız yoğun bir sıkıntı, süreğen bir umutsuzluk ya da güvenliğinizi tehdit eden düşünceler içeriyorsa, lütfen profesyonel ve gerektiğinde acil yardım alın; acil durumlarda 112 Acil hattını arayabilirsiniz. Kişisel gelişim desteği, bu tür durumlarda klinik bir değerlendirmenin yerini tutmaz."
        ]
      }
    ],
    "faq": [
      {
        "q": "Kişisel gelişim ile terapi arasındaki fark nedir?",
        "a": "Kişisel gelişim, bir rahatsızlığı ele almaktan çok kendini tanımaya, güçlü yanları geliştirmeye ve hedeflere yönelmeye odaklanır. Terapi ise daha çok belirli psikolojik zorlukların anlaşılması ve iyileştirilmesiyle ilgilenir. Görüşmelerde size hangi yaklaşımın daha uygun olduğunu birlikte değerlendirebiliriz."
      },
      {
        "q": "Belirli bir sorunum yoksa da başvurabilir miyim?",
        "a": "Evet. Kişisel gelişim desteği için bir sorun ya da tanı gerekmez. Kendinizi daha iyi anlamak, bir konuda netleşmek veya yaşamınıza dair yeni bir bakış kazanmak isteyen herkes bu süreçten yararlanabilir."
      },
      {
        "q": "Bu süreçte bana hazır çözümler sunulacak mı?",
        "a": "Hayır. Amaç, dışarıdan reçeteler vermek değil, kendi yanıtlarınıza ulaşmanızı desteklemektir. Görüşmelerde size eşlik eder, fark etmenizi kolaylaştıran sorular ve alan sunarız; tercihler ve kararlar size aittir."
      },
      {
        "q": "Süreç ne kadar sürer?",
        "a": "Süre tamamen sizin hedeflerinize ve keşfetmek istediklerinize bağlı olarak değişir. Kısa, odaklı bir çalışma da olabilir, daha uzun süreli bir yolculuk da. Bunu ilk görüşmelerde birlikte konuşur, size uygun bir tempo belirleriz."
      }
    ]
  }
];

/** Tüm hizmet slug'ları (generateStaticParams için). */
export function getServiceSlugs(): string[] {
  return services.map((s) => s.slug);
}

/** Slug'a göre hizmeti getirir. */
export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
