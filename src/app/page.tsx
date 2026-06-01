import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import ProcessSection from "@/components/ProcessSection";
import Team from "@/components/Team";
import AppointmentForm from "@/components/AppointmentForm";
import FaqSection from "@/components/FaqSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";

export default function Home() {
  return (
    <>
      <Header />
      <main id="icerik">
        <Hero />
        <About />
        <Services />
        <ProcessSection />
        <Team />
        <AppointmentForm />
        <FaqSection />
        <Contact />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
