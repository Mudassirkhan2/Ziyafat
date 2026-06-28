"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";

export const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

export const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-6% 0px" },
  transition: { duration: 0.7, ease: EASE },
};

export function Counter({ end, suffix = "", decimals = 0 }: { end: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 60;
    const id = setInterval(() => {
      frame++;
      setVal(end * Math.min(frame / total, 1));
      if (frame >= total) clearInterval(id);
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView, end]);
  const display = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN");
  return <span ref={ref}>{display}{suffix}</span>;
}
