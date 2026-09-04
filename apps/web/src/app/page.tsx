import { AtelierSection } from "@/components/sections/atelier-section";
import { BookingCta } from "@/components/sections/booking-cta";
import { GallerySection } from "@/components/sections/gallery-section";
import { HomeHero } from "@/components/sections/home-hero";
import { IntroSection } from "@/components/sections/intro-section";
import { ServicesSection } from "@/components/sections/services-section";
import { TestimonialSection } from "@/components/sections/testimonial-section";
import { HomeMotion } from "@/components/layout/home-motion";

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <HomeMotion />
      <HomeHero />
      <IntroSection />
      <ServicesSection />
      <GallerySection />
      <AtelierSection />
      <TestimonialSection />
      <BookingCta />
    </main>
  );
}
