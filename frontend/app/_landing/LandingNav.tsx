"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import s from "../landing.module.css";
import { LogoMark } from "./icons";

const NAV_IDS = ["platform", "modules", "features", "workspace", "customers"] as const;
const NAV_LINKS = [
  { id: "platform",  label: "Platform" },
  { id: "modules",   label: "Modules" },
  { id: "features",  label: "Features" },
  { id: "workspace", label: "Workspace" },
  { id: "customers", label: "Customers" },
] as const;

export default function LandingNav() {
  const [activeId, setActiveId] = useState<string>("");
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const diff = y - lastScrollY.current;

      // Hide/show logic
      if (y < 80) {
        setHidden(false);
      } else if (diff > 6) {
        setHidden(true);
      } else if (diff < -6) {
        setHidden(false);
      }
      lastScrollY.current = y;

      // Active section logic
      const offset = 72 + 24;
      let current = "";
      for (const id of NAV_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      setActiveId(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className={[s.nav, hidden && s.navHidden].filter(Boolean).join(" ")}>
      <div className={`${s.wrap} ${s.navIn}`}>
        <Link href="/" className={s.brand}>
          <LogoMark gradId="nav-grad" />
          Ziyafat
        </Link>
        <nav className={s.navLinks}>
          {NAV_LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeId === id ? s.navActive : undefined}
              onClick={(e) => handleNavClick(e, id)}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className={s.navCta}>
          <Link href="/login" className={s.navSign}>Sign in</Link>
          <Link href="/signup" className={`${s.btn} ${s.btnGold}`}>Start free</Link>
        </div>
      </div>
    </header>
  );
}
