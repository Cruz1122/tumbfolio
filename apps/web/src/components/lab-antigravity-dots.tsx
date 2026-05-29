"use client";

import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from "react";

import {
  GRAVITY_ACCELERATION,
  clamp,
  createLabAntigravityConfig,
  createLabDotParticles,
  type LabDotParticle
} from "@/lib/visual/labDotSystem";

function distributeOnRectPerimeter(
  rank: number,
  total: number,
  halfW: number,
  halfH: number,
  centerX: number,
  centerY: number
) {
  const perimeter = 4 * (halfW + halfH);
  const dist = (rank / total) * perimeter;

  const topEdge = 2 * halfW;
  const rightEdge = 2 * halfH;
  const bottomEdge = 2 * halfW;

  if (dist < topEdge) {
    const p = dist / topEdge;
    return { x: centerX - halfW + p * 2 * halfW, y: centerY - halfH };
  }
  const r = dist - topEdge;
  if (r < rightEdge) {
    const p = r / rightEdge;
    return { x: centerX + halfW, y: centerY - halfH + p * 2 * halfH };
  }
  const b = r - rightEdge;
  if (b < bottomEdge) {
    const p = b / bottomEdge;
    return { x: centerX + halfW - p * 2 * halfW, y: centerY + halfH };
  }
  const p = (b - bottomEdge) / (2 * halfH);
  return { x: centerX - halfW, y: centerY + halfH - p * 2 * halfH };
}

interface LabAntigravityDotsProps {
  className?: string;
  isDragging: boolean;
  accent?: "orange" | "green" | "red";
}

interface MotionProfile {
  isCompact: boolean;
  reducedMotion: boolean;
}

interface PointerState {
  active: boolean;
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  speed: number;
  lastMoveAt: number;
}

function useMotionProfile(): MotionProfile {
  const [state, setState] = useState<MotionProfile>({
    isCompact: false,
    reducedMotion: false
  });

  useEffect(() => {
    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setState({
        isCompact: window.innerWidth < 768 || coarseQuery.matches,
        reducedMotion: reducedQuery.matches
      });
    };

    update();

    coarseQuery.addEventListener("change", update);
    reducedQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      coarseQuery.removeEventListener("change", update);
      reducedQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return state;
}

function isInsideContainer(
  containerRef: RefObject<HTMLDivElement | null>,
  clientX: number,
  clientY: number
) {
  const rect = containerRef.current?.getBoundingClientRect();

  if (!rect) {
    return null;
  }

  return {
    inside:
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom,
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function setDotElement(
  element: HTMLDivElement,
  particle: LabDotParticle,
  size: number,
  opacity: number,
  squash: number,
  angle: number
) {
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.opacity = String(opacity);
  element.style.backgroundColor = particle.color;

  element.style.transform = `translate3d(${particle.cx - size / 2}px, ${
    particle.cy - size / 2
  }px, 0) rotate(${angle}rad) scale(${1 + squash}, ${1 - squash * 0.32})`;
}

export default /*#__PURE__*/memo(function LabAntigravityDots({
  className,
  isDragging,
  accent = "orange",
}: LabAntigravityDotsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const particlesRef = useRef<LabDotParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const virtualMouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const revealedUpToRef = useRef(9999);
  const revealAccumulatorRef = useRef(0);
  const fadeStartRef = useRef<Map<number, number>>(new Map());
  const dragOrderRef = useRef<number[]>([]);
  const accentRef = useRef<"orange" | "green" | "red">(accent);
  const FADE_DURATION = 8000;

const ACCENT_ORANGE = ["#EA580C", "#F97316", "#C2410C", "#FDBA74"];
const ACCENT_GREEN = ["#16A34A", "#22C55E", "#15803D", "#86EFAC"];
const ACCENT_RED = ["#DC2626", "#EF4444", "#B91C1C", "#FCA5A5"];

const ACCENT_PALETTES: Record<string, readonly string[]> = {
  orange: ACCENT_ORANGE,
  green: ACCENT_GREEN,
  red: ACCENT_RED,
};

  const pointerRef = useRef<PointerState>({
    active: false,
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    speed: 0,
    lastMoveAt: -10_000
  });

  const { isCompact, reducedMotion } = useMotionProfile();

  const config = useMemo(
    () => createLabAntigravityConfig(isCompact, reducedMotion),
    [isCompact, reducedMotion]
  );

  const [particles, setParticles] = useState<LabDotParticle[]>([]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    accentRef.current = accent;
  }, [accent]);

  // Update dot colors in-place when accent changes (no particle recreation needed)
  useEffect(() => {
    const palette = ACCENT_PALETTES[accent] ?? ACCENT_ORANGE;
    const particles = particlesRef.current;
    const dots = dotRefs.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p) {
        p.color = palette[i % palette.length]!;
      }
    }

    // Immediately apply to visible DOM elements
    for (let i = 0; i < dots.length; i++) {
      const el = dots[i];
      const p = particles[i];
      if (el && p) {
        el.style.backgroundColor = p.color;
      }
    }
  }, [accent]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const rebuild = () => {
      const rect = container.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const nextParticles = createLabDotParticles({
        width: rect.width,
        height: rect.height,
        isCompact,
        reducedMotion
      });

      particlesRef.current = nextParticles;
      dotRefs.current = [];
      setParticles(nextParticles);
    };

    rebuild();

    const resizeObserver = new ResizeObserver(rebuild);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isCompact, reducedMotion]);

  useEffect(() => {
    const deactivatePointer = () => {
      pointerRef.current.active = false;
      pointerRef.current.speed = 0;
      pointerRef.current.lastMoveAt = -10_000;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const localPointer = isInsideContainer(
        containerRef,
        event.clientX,
        event.clientY
      );

      if (!localPointer?.inside) {
        deactivatePointer();
        return;
      }

      const pointer = pointerRef.current;
      const dx = localPointer.x - pointer.lastX;
      const dy = localPointer.y - pointer.lastY;

      pointer.active = true;
      pointer.x = localPointer.x;
      pointer.y = localPointer.y;
      pointer.speed = Math.hypot(dx, dy);
      pointer.lastX = localPointer.x;
      pointer.lastY = localPointer.y;
      pointer.lastMoveAt = performance.now();
    };

    const handleScroll = () => {
      const rect = containerRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        deactivatePointer();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true
    });

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    window.addEventListener("pointerleave", deactivatePointer, {
      passive: true
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerleave", deactivatePointer);
    };
  }, []);

  useEffect(() => {
    const tick = (time: number) => {
      const lastFrameTime = lastFrameTimeRef.current ?? time;
      const delta = clamp((time - lastFrameTime) / 1000, 1 / 120, 1 / 30);

      lastFrameTimeRef.current = time;
      elapsedRef.current += delta;

      const container = containerRef.current;
      const rect = container?.getBoundingClientRect();

      if (!container || !rect) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const pointer = pointerRef.current;

      if (time - pointer.lastMoveAt > 2000) {
        pointer.active = false;
        pointer.speed *= 0.92;
      }

      let destX = pointer.x;
      let destY = pointer.y;

      if (config.autoAnimate && !pointer.active && !isDraggingRef.current) {
        destX =
          rect.width / 2 +
          Math.sin(elapsedRef.current * 0.5) * (rect.width / 4);

        destY =
          rect.height / 2 +
          Math.cos(elapsedRef.current) * (rect.height / 4);
      }

      if (reducedMotion) {
        destX = rect.width / 2 + (destX - rect.width / 2) * 0.18;
        destY = rect.height / 2 + (destY - rect.height / 2) * 0.18;
      } else if (isCompact) {
        destX = rect.width / 2 + (destX - rect.width / 2) * 0.64;
        destY = rect.height / 2 + (destY - rect.height / 2) * 0.64;
      }

      const smoothFactor = reducedMotion ? 0.025 : 0.05;

      virtualMouseRef.current.x +=
        (destX - virtualMouseRef.current.x) * smoothFactor;

      virtualMouseRef.current.y +=
        (destY - virtualMouseRef.current.y) * smoothFactor;

      const targetX = virtualMouseRef.current.x;
      const targetY = virtualMouseRef.current.y;

      const globalRotation = elapsedRef.current * config.rotationSpeed;
      const speedAcceleration = clamp(
        pointer.speed / GRAVITY_ACCELERATION,
        0.85,
        3.8
      );

      const currentParticles = particlesRef.current;

      if (isDraggingRef.current) {
        revealedUpToRef.current = -1;
        revealAccumulatorRef.current = 0;
        if (dragOrderRef.current.length === 0) {
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const evens: number[] = [];
          for (let i = 0; i < currentParticles.length; i += 2) {
            evens.push(i);
          }
          evens.sort((a, b) => {
            const pa = currentParticles[a]!;
            const pb = currentParticles[b]!;
            return Math.atan2(pa.my - cy, pa.mx - cx) - Math.atan2(pb.my - cy, pb.mx - cx);
          });
          dragOrderRef.current = evens;
        }
      } else {
        dragOrderRef.current = [];
        if (revealedUpToRef.current < currentParticles.length) {
          revealAccumulatorRef.current += 2;
          const steps = Math.floor(revealAccumulatorRef.current / 2);
          if (steps > 0) {
            revealedUpToRef.current += steps * 2;
            revealAccumulatorRef.current -= steps * 2;
          }
          if (revealedUpToRef.current > currentParticles.length) {
            revealedUpToRef.current = currentParticles.length;
          }
        }
      }

      for (let index = 0; index < currentParticles.length; index += 1) {
        const particle = currentParticles[index]!;
        const element = dotRefs.current[index];

        if (!element) {
          continue;
        }

        particle.t += particle.speed;

        const wasHidden = element.style.display === "none";
        const shouldHide = isDraggingRef.current
          ? index & 1
          : (index & 1) && index > revealedUpToRef.current;

        if (shouldHide) {
          element.style.display = "none";
          fadeStartRef.current.delete(index);
          continue;
        }

        if (wasHidden) {
          fadeStartRef.current.set(index, time);
        }

        element.style.display = "";

        const projectionFactor = 1 - particle.cz / 500;
        const projectedTargetX = targetX * projectionFactor;
        const projectedTargetY = targetY * projectionFactor;

        const dx = particle.mx - projectedTargetX;
        const dy = particle.my - projectedTargetY;
        const dist = Math.hypot(dx, dy);
        const orbitalAngle =
          Math.atan2(dy, dx) + globalRotation + particle.slipOffset * 0.08;

        let targetPosX = particle.mx;
        let targetPosY = particle.my;

        if (isDraggingRef.current) {
          const fraction = 0.24;
          let halfW = rect.width * fraction;
          let halfH = halfW * (9 / 16);
          if (halfH > rect.height * fraction) {
            halfH = rect.height * fraction;
            halfW = halfH * (16 / 9);
          }
          const rPos = distributeOnRectPerimeter(
            dragOrderRef.current.indexOf(index),
            dragOrderRef.current.length,
            halfW,
            halfH,
            rect.width / 2,
            rect.height / 2
          );
          targetPosX = rPos.x;
          targetPosY = rPos.y;
        } else if (dist < config.magnetRadius && !reducedMotion) {
          const influence = Math.pow(1 - dist / config.magnetRadius, 1.45);

          const wave =
            Math.sin(
              particle.t * config.waveSpeed * 100 + orbitalAngle
            ) *
            config.waveAmplitude *
            influence;

          const deviation =
            particle.randomRadiusOffset * (5 / (config.fieldStrength + 0.1));

          const currentRingRadius =
            config.ringRadius +
            wave +
            deviation +
            influence * speedAcceleration * 8;

          targetPosX =
            projectedTargetX + currentRingRadius * Math.cos(orbitalAngle);

          targetPosY =
            projectedTargetY + currentRingRadius * Math.sin(orbitalAngle);
        }

        particle.cx += (targetPosX - particle.cx) * config.lerpSpeed;
        particle.cy += (targetPosY - particle.cy) * config.lerpSpeed;

        const currentDistToMouse = Math.hypot(
          particle.cx - projectedTargetX,
          particle.cy - projectedTargetY
        );

        const distFromRing = Math.abs(currentDistToMouse - config.ringRadius);
        const ringProximity = clamp(1 - distFromRing / 90, 0, 1);

        const pulse = reducedMotion
          ? 1
          : 0.92 +
            Math.sin(
              particle.t * config.pulseSpeed * 100 + particle.pulseOffset
            ) *
              0.08;

        const finalSize =
          particle.baseScale *
          particle.scale *
          config.particleSize *
          pulse *
          (1 + ringProximity * 0.12);

        const slip = reducedMotion
          ? 0
          : Math.sin(
              particle.t * config.waveSpeed * 120 + particle.rotationOffset
            ) *
            ringProximity *
            0.11;

        const velocityAngle =
          Math.atan2(targetPosY - particle.cy, targetPosX - particle.cx) +
          Math.PI / 2;

        const angle = velocityAngle + slip;

        const squash = reducedMotion
          ? 0
          : clamp(ringProximity * speedAcceleration * 0.032, 0, 0.14);

        let renderOpacity = particle.opacity;
        const fadeStart = fadeStartRef.current.get(index);
        if (fadeStart !== undefined) {
          const progress = Math.min((time - fadeStart) / FADE_DURATION, 1);
          renderOpacity *= progress;
          if (progress >= 1) {
            fadeStartRef.current.delete(index);
          }
        }

        setDotElement(
          element,
          particle,
          finalSize,
          renderOpacity,
          squash,
          angle
        );
      }

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = null;
      lastFrameTimeRef.current = null;
    };
  }, [config, isCompact, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={className}
      ref={containerRef}
      style={{ contain: "paint" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, index) => (
          <div
            className="lab-dot absolute left-0 top-0 rounded-full"
            key={particle.id}
            ref={(element) => {
              dotRefs.current[index] = element;
            }}
            style={{ willChange: "transform" }}
          />
        ))}
      </div>
    </div>
  );
});
