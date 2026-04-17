"use client";

import { useEffect, useMemo, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*+=-_";

type HeroAnimatedTitleProps = {
  lines: string[];
  className?: string;
  startDelayMs?: number;
  lineStaggerMs?: number;
  hovered?: boolean;
};

function glyphForIndex(index: number, frame: number) {
  const glyphIndex = (index * 13 + frame * 7) % GLYPHS.length;
  return GLYPHS[glyphIndex];
}

function scrambleText(target: string, frame: number) {
  return target
    .split("")
    .map((char, index) => {
      if (char === " ") {
        return " ";
      }

      return index < frame ? char : glyphForIndex(index, frame);
    })
    .join("");
}

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function hoverScramble(target: string, rate: number) {
  return target
    .split("")
    .map((char) => {
      if (char === " ") {
        return " ";
      }
      return Math.random() < rate ? randomGlyph() : char;
    })
    .join("");
}

type AnimatedLineProps = {
  text: string;
  startDelayMs: number;
  hovered: boolean;
};

function AnimatedLine({ text, startDelayMs, hovered }: AnimatedLineProps) {
  const [displayText, setDisplayText] = useState(() => scrambleText(text, 0));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let frame = 0;
    let intervalId: number | undefined;

    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        frame += 1;
        setDisplayText(scrambleText(text, frame));

        if (frame >= text.replace(/\s/g, "").length + 3) {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
          setDisplayText(text);
          setSettled(true);
        }
      }, 44);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [startDelayMs, text]);

  useEffect(() => {
    if (!settled) {
      return;
    }

    if (!hovered) {
      setDisplayText(text);
      return;
    }

    let tick = 0;
    const intervalId = window.setInterval(() => {
      tick += 1;
      if (tick % 4 === 0) {
        setDisplayText(text);
      } else {
        const rate = 0.22 + Math.random() * 0.28;
        setDisplayText(hoverScramble(text, rate));
      }
    }, 70);

    return () => {
      window.clearInterval(intervalId);
      setDisplayText(text);
    };
  }, [hovered, settled, text]);

  return (
    <span
      className={`hero-assemble__line ${settled ? "is-settled" : ""} ${
        hovered && settled ? "is-breaking" : ""
      }`.trim()}
      data-text={text}
    >
      {displayText}
    </span>
  );
}

export function HeroAnimatedTitle({
  lines,
  className,
  startDelayMs = 0,
  lineStaggerMs = 260,
  hovered = false,
}: HeroAnimatedTitleProps) {
  const concatenated = useMemo(() => lines.join(" "), [lines]);

  return (
    <h1
      className={`${className ?? ""} hero-assemble ${hovered ? "is-hovered" : ""}`.trim()}
      data-text={concatenated}
    >
      {lines.map((line, index) => (
        <AnimatedLine
          key={`${line}-${index}`}
          text={line}
          startDelayMs={startDelayMs + index * lineStaggerMs}
          hovered={hovered}
        />
      ))}
    </h1>
  );
}
