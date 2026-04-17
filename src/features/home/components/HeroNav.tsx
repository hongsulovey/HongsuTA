"use client";

import Link from "next/link";
import { useUiHoverTrigger } from "@/shared/hooks/useUiHoverTrigger";

const navItems = [
  { label: "ABOUT", href: "/about" },
  { label: "PROJECTS", href: "/projects" },
  { label: "CONTACT", href: "/contact" },
  { label: "GITHUB", href: "https://github.com/hongsulovey", external: true },
];

export function HeroNav() {
  const hoverProps = useUiHoverTrigger();

  return (
    <header className="hero-nav">
      <div className="hero-nav__inner hero-glass-panel">
        <Link
          href="/"
          className="hero-nav__brand hero-glitch-hover"
          data-text="CHOI HONGSU"
          {...hoverProps}
        >
          <span className="hero-glitch-hover__label">CHOI HONGSU</span>
        </Link>
        <nav className="hero-nav__menu" aria-label="Primary">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hero-nav__link hero-glitch-hover"
                data-text={item.label}
                {...hoverProps}
              >
                <span className="hero-glitch-hover__label">{item.label}</span>
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="hero-nav__link hero-glitch-hover"
                data-text={item.label}
                {...hoverProps}
              >
                <span className="hero-glitch-hover__label">{item.label}</span>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
