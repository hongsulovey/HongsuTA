import { homeContent } from "@/features/home/data/homeContent";

export function ContactSection() {
  return (
    <section className="section">
      <div className="container">
        <h2>Contact</h2>
        <p className="muted">프로젝트 관련 문의나 협업 제안은 아래 채널로 연락할 수 있습니다.</p>
        <div className="glitch-cluster" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          <a
            href={`mailto:${homeContent.contact.email}`}
            className="btn hero-glitch-hover"
            data-text={homeContent.contact.email}
          >
            <span className="hero-glitch-hover__label">{homeContent.contact.email}</span>
          </a>
          <a
            href={homeContent.contact.github}
            target="_blank"
            rel="noreferrer"
            className="btn hero-glitch-hover"
            data-text="GitHub"
          >
            <span className="hero-glitch-hover__label">GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
}
