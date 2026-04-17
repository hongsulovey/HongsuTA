import { homeContent } from "@/features/home/data/homeContent";

export function SkillsSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>Skills / Tech</h2>
        <div className="badge-list">
          {homeContent.skills.map((skill) => (
            <span key={skill} className="badge">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
