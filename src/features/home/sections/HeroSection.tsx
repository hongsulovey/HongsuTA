import { HeroCanvas } from "@/features/home/components/HeroCanvas";
import { HeroController } from "@/features/home/components/HeroController";
import { HeroOverlay } from "@/features/home/components/HeroOverlay";

export function HeroSection() {
  return (
    <section className="section" style={{ borderTop: "none", paddingTop: "2rem" }}>
      <div className="container">
        <div style={{ position: "relative", minHeight: 460 }}>
          <HeroCanvas />
          <HeroOverlay />
          <HeroController />
        </div>
      </div>
    </section>
  );
}
