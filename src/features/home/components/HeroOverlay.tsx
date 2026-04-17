import Link from "next/link";
import { homeContent } from "@/features/home/data/homeContent";

export function HeroOverlay() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(720px, 90%)", textAlign: "center" }}>
        <p className="muted" style={{ marginBottom: 8 }}>
          {homeContent.role}
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", margin: 0 }}>{homeContent.name}</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          {homeContent.tagline}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
          <Link href="/projects/ovensmash-rendering" className="btn">
            View Project
          </Link>
          <Link href="/contact" className="btn">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
