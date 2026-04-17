import { homeContent } from "@/features/home/data/homeContent";

export function AboutSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>About</h2>
        <p>{homeContent.intro}</p>
      </div>
    </section>
  );
}
