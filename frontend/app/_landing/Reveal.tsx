"use client";
import { motion } from "framer-motion";
import { reveal } from "./utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay }: RevealProps) {
  const transition = delay ? { ...reveal.transition, delay } : reveal.transition;
  return (
    <motion.div
      className={className}
      initial={reveal.initial}
      whileInView={reveal.whileInView}
      viewport={reveal.viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
