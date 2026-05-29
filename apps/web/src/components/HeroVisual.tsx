"use client";

import LabAntigravityDots from "@/components/lab-antigravity-dots";

interface HeroVisualProps {
  isDragging: boolean;
  accent: "orange" | "green" | "red";
}

export function HeroVisual({ isDragging, accent }: HeroVisualProps) {
  return (
    <LabAntigravityDots
      className="hero-bloom absolute inset-0 z-0"
      isDragging={isDragging}
      accent={accent}
    />
  );
}
