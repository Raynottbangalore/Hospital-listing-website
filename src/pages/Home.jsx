import { Hero } from "../components/home/Hero";
import { Stats } from "../components/home/Stats";
import { FeaturedHospitals } from "../components/home/FeaturedHospitals";
import { Specializations } from "../components/home/Specializations";
import { EmergencyBanner } from "../components/home/EmergencyBanner";
import { Testimonials } from "../components/home/Testimonials";
import { WhyChooseUs } from "../components/home/WhyChooseUs";
import { OffersSection } from "../components/home/OffersSection";

export const Home = () => {
  return (
    <div className="overflow-hidden space-y-12 md:space-y-0">
      <Hero />
      <Stats />
      <OffersSection />
      <Specializations />
      <WhyChooseUs />
      <FeaturedHospitals />
      <EmergencyBanner />
      <Testimonials />
    </div>
  );
};
