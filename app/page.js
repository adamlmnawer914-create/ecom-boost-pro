import {
  Navbar,
  HeroSection,
  SpeedBenchmarkSection,
  FeaturesSection,
  ShowcaseSection,
  TestimonialsSection,
  PricingSection,
  UrgencySection,
  FAQSection,
  Footer,
} from "./components";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SpeedBenchmarkSection />
        <FeaturesSection />
        <ShowcaseSection />
        <TestimonialsSection />
        <PricingSection />
        <UrgencySection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
