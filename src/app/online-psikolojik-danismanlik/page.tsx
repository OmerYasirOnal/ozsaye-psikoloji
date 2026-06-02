import type { Metadata } from "next";
import CampaignLanding from "@/components/CampaignLanding";

export const metadata: Metadata = {
  title: "Online Psikolojik Danışmanlık | Öz & Saye Psikoloji",
  description:
    "Online ve yüz yüze psikolojik danışmanlık için güvenli, etik ve bireye özel destek süreci.",
  alternates: { canonical: "/online-psikolojik-danismanlik" },
};

export default function Page() {
  return (
    <CampaignLanding
      eyebrow="Online & Yüz Yüze Destek"
      title="Kendinize güvenli bir yerden yaklaşın."
      lead="Online psikolojik danışmanlık, bulunduğunuz yerden güvenli ve erişilebilir bir destek alanı oluşturur. Süreç; gizlilik, etik ilkeler ve bireye özel ihtiyaçlar temelinde planlanır."
      summary="Online görüşmeler; kendinizi daha iyi anlamanız, yaşamınızdaki zorlukları yapılandırmanız ve sürdürülebilir bir destek süreci kurmanız için tasarlanır."
      services={[
        "Online görüşme seçeneği",
        "Yüz yüze görüşme planlaması",
        "Gizlilik ve etik süreç",
        "Bireye özel yol haritası",
      ]}
      faqs={[
        {
          question: "Online görüşmeler nasıl gerçekleşiyor?",
          answer:
            "Randevu planlandıktan sonra uygun dijital görüşme kanalı üzerinden, gizlilik ilkeleri korunarak süreç başlatılır.",
        },
        {
          question: "İlk görüşmede ne konuşulur?",
          answer:
            "İlk görüşmede ihtiyaçlarınız, beklentileriniz ve süreç hedefleri değerlendirilir; size uygun yol haritası birlikte belirlenir.",
        },
        {
          question: "Online destek herkes için uygun mudur?",
          answer:
            "Uygunluk kişinin ihtiyacına göre değerlendirilir. Gerekli durumlarda yüz yüze destek ya da farklı yönlendirmeler önerilebilir.",
        },
      ]}
    />
  );
}
