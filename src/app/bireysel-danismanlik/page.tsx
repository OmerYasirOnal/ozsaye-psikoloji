import type { Metadata } from "next";
import CampaignLanding from "@/components/CampaignLanding";

export const metadata: Metadata = {
  title: "Bireysel Psikolojik Danışmanlık | Öz & Saye Psikoloji",
  description:
    "Bireysel psikolojik danışmanlık için güvenli, etik ve kişiye özel destek süreci.",
  alternates: { canonical: "/bireysel-danismanlik" },
};

export default function Page() {
  return (
    <CampaignLanding
      eyebrow="Kişiye Özel Süreç"
      title="Kendi hikâyenizi daha net duymaya başlayın."
      lead="Bireysel danışmanlık süreci; yaşadığınız deneyimleri anlamlandırmanız, duygusal farkındalık geliştirmeniz ve yaşamınızda daha dengeli adımlar atmanız için destek sunar."
      summary="Her bireyin ihtiyacı farklıdır. Bu nedenle görüşmeler; güvenli alan, etik çerçeve ve kişisel hedefleriniz doğrultusunda planlanır."
      services={[
        "Kendini tanıma ve farkındalık",
        "Yaşam geçişlerinde destek",
        "Stresle başa çıkma becerileri",
        "Güvenli ve gizli görüşme alanı",
      ]}
      faqs={[
        {
          question: "Bireysel danışmanlık kimler için uygundur?",
          answer:
            "Kendini tanımak, yaşam deneyimlerini anlamlandırmak ve profesyonel destekle ilerlemek isteyen kişiler için değerlendirilebilir.",
        },
        {
          question: "Seans sıklığı nasıl belirlenir?",
          answer:
            "Sıklık, ilk değerlendirme sonrasında ihtiyaçlarınıza ve hedeflerinize göre uzmanla birlikte planlanır.",
        },
        {
          question: "Görüşmeler gizli tutulur mu?",
          answer:
            "Görüşmeler mesleki etik ilkeler ve gizlilik çerçevesinde yürütülür. Yasal istisnalar ayrıca bilgilendirilir.",
        },
      ]}
    />
  );
}
