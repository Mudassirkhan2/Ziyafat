import s from "./landing.module.css";
import LandingNav from "./_landing/LandingNav";
import LandingHero from "./_landing/LandingHero";
import LandingLogos from "./_landing/LandingLogos";
import LandingBento from "./_landing/LandingBento";
import LandingFeatures from "./_landing/LandingFeatures";
import LandingTour from "./_landing/LandingTour";
import LandingTestimonials from "./_landing/LandingTestimonials";
import LandingStats from "./_landing/LandingStats";
import LandingCta from "./_landing/LandingCta";
import LandingBlog from "./_landing/LandingBlog";
import LandingContact from "./_landing/LandingContact";
import LandingFooter from "./_landing/LandingFooter";

export default function LandingClient() {
  return (
    <div className={s.root}>
      <LandingNav />
      <div className={s.navSpacer} />
      <main>
        <LandingHero />
        <LandingLogos />
        <LandingBento />
        <LandingFeatures />
        <LandingTour />
        <LandingTestimonials />
        <LandingStats />
        <LandingCta />
        <LandingBlog />
        <LandingContact />
      </main>
      <LandingFooter />
    </div>
  );
}
