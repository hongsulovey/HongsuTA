import { AboutSection } from "@/features/home/sections/AboutSection";
import { ContactSection } from "@/features/home/sections/ContactSection";
import { HeroSection } from "@/features/home/sections/HeroSection";
import { SelectedProjectsSection } from "@/features/home/sections/SelectedProjectsSection";
import { SkillsSection } from "@/features/home/sections/SkillsSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SelectedProjectsSection />
      <SkillsSection />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
