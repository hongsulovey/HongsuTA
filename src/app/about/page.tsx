import { homeContent } from "@/features/home/data/homeContent";

export default function AboutPage() {
  return (
    <main className="container section">
      <h1>About</h1>
      <p className="muted">{homeContent.role} / Rendering / Shader / Look Development</p>
      <p>{homeContent.intro}</p>
      <div className="badge-list" style={{ marginTop: 16 }}>
        {homeContent.skills.map((skill) => (
          <span key={skill} className="badge">
            {skill}
          </span>
        ))}
      </div>
    </main>
  );
}
