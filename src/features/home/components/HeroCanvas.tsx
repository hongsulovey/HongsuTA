"use client";

export function HeroCanvas() {
  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        minHeight: 420,
        borderRadius: 16,
        border: "1px solid var(--line)",
        background:
          "radial-gradient(circle at 20% 20%, rgba(110, 168, 255, 0.18), transparent 40%), linear-gradient(145deg, #0b101a, #0d1118)",
      }}
    >
      {/* TODO: Replace with R3F CanvasRoot + HeroScene + PostFxRoot */}
    </div>
  );
}
