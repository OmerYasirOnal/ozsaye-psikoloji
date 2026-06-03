import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import ProcessSection from "@/components/ProcessSection";
import Team from "@/components/Team";
import AppointmentForm from "@/components/AppointmentForm";
import FaqSection from "@/components/FaqSection";
import Articles from "@/components/Articles";
import Contact from "@/components/Contact";

// Header / Footer / StickyCta artık kök layout'ta (tüm sayfalarda ortak).
export default function Home() {
  return (
    <main id="icerik">
      <Hero />
      <About />
      <Services />
      <ProcessSection />
      <Team />
      <AppointmentForm />
      <FaqSection />
      <Articles />
      <Contact />
    </main>
  );
}
