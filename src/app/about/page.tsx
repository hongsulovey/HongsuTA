import { homeContent } from "@/features/home/data/homeContent";

export default function AboutPage() {
  return (
    <main className="container section about-section">
      <h1>About</h1>
      <p className="muted">{homeContent.role} · Rendering · Shader · Performance</p>

      <div className="about-section__body">
        {homeContent.aboutParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <ul className="about-section__identity" aria-label="Identity">
        {homeContent.identity.map((line, index) => (
          <li key={index}>
            <span className="about-section__identity-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="about-section__groups">
        {homeContent.skillGroups.map((group) => (
          <div key={group.title} className="skill-group">
            <h3 className="skill-group__title">{group.title}</h3>
            <ul className="skill-group__items">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
