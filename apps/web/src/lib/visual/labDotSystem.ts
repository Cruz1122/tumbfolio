export const GRAVITY_ACCELERATION = 9.80665;

export const LAB_DOT_COLORS = [
  "#EA580C",
  "#F97316",
  "#C2410C",
  "#FDBA74"
] as const;

export interface LabDotParticle {
  id: string;

  mx: number;
  my: number;
  mz: number;
  cz: number;

  cx: number;
  cy: number;

  t: number;
  speed: number;
  scale: number;
  baseScale: number;
  opacity: number;

  color: string;
  randomRadiusOffset: number;
  rotationOffset: number;
  pulseOffset: number;
  slipOffset: number;
}

interface CreateLabDotsInput {
  width: number;
  height: number;
  isCompact: boolean;
  reducedMotion: boolean;
}

export interface LabAntigravityConfig {
  autoAnimate: boolean;
  count: number;
  fieldStrength: number;
  lerpSpeed: number;
  magnetRadius: number;
  particleSize: number;
  pulseSpeed: number;
  ringRadius: number;
  rotationSpeed: number;
  waveAmplitude: number;
  waveSpeed: number;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createLabAntigravityConfig(
  isCompact: boolean,
  reducedMotion: boolean
): LabAntigravityConfig {
  if (reducedMotion) {
    return {
      autoAnimate: true,
      count: 21,
      fieldStrength: 10,
      lerpSpeed: 0.045,
      magnetRadius: 150,
      particleSize: 1,
      pulseSpeed: 0.3,
      ringRadius: 150,
      rotationSpeed: 0,
      waveAmplitude: 8,
      waveSpeed: 0.42
    };
  }

  if (isCompact) {
    return {
      autoAnimate: true,
      count: 34,
      fieldStrength: 10,
      lerpSpeed: 0.052,
      magnetRadius: 175,
      particleSize: 1,
      pulseSpeed: 0.18,
      ringRadius: 132,
      rotationSpeed: 0,
      waveAmplitude: 12,
      waveSpeed: 0.42
    };
  }

  return {
    autoAnimate: true,
      count: 53,
      fieldStrength: 10,
      lerpSpeed: 0.052,
      magnetRadius: 215,
      particleSize: 1,
      pulseSpeed: 0.12,
    ringRadius: 158,
    rotationSpeed: 0,
    waveAmplitude: 16,
    waveSpeed: 0.42
  };
}

function createSeededRandom(seed = 8189) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function isInsideProtectedCenter(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;

  const protectedWidth = Math.min(width * 0.58, 720);
  const protectedHeight = Math.min(height * 0.52, 460);

  const normalizedX = (x - centerX) / (protectedWidth / 2);
  const normalizedY = (y - centerY) / (protectedHeight / 2);

  return normalizedX * normalizedX + normalizedY * normalizedY < 1;
}

function projectOutsideProtectedCenter(
  x: number,
  y: number,
  width: number,
  height: number,
  random: () => number
) {
  const centerX = width / 2;
  const centerY = height / 2;

  const dx = x - centerX || 1;
  const dy = y - centerY || 1;
  const angle = Math.atan2(dy, dx);

  const radiusX = Math.min(width * 0.42, 520);
  const radiusY = Math.min(height * 0.36, 340);

  return {
    x: centerX + Math.cos(angle) * radiusX * (0.92 + random() * 0.24),
    y: centerY + Math.sin(angle) * radiusY * (0.92 + random() * 0.24)
  };
}

export function createLabDotParticles({
  width,
  height,
  isCompact,
  reducedMotion
}: CreateLabDotsInput): LabDotParticle[] {
  const random = createSeededRandom(
    Math.round(width * 13 + height * 7 + (isCompact ? 43 : 19))
  );

  const count = reducedMotion ? 21 : isCompact ? 34 : 53;

  return Array.from({ length: count }, (_, index) => {
    let x = random() * width;
    let y = random() * height;

    if (isInsideProtectedCenter(x, y, width, height)) {
      const projected = projectOutsideProtectedCenter(
        x,
        y,
        width,
        height,
        random
      );

      x = clamp(projected.x, 20, width - 20);
      y = clamp(projected.y, 20, height - 20);
    }

    const depth = random();
    const baseScale = isCompact ? 3.2 + depth * 4.2 : 3.4 + depth * 5.4;

    return {
      id: `lab-dot-${index}`,

      mx: x,
      my: y,
      mz: -12 + random() * 24,
      cz: -12 + random() * 24,

      cx: x,
      cy: y,

      t: random() * 100,
      speed: 0.006 + random() * 0.018,
      scale: 0.72 + random() * 0.68,
      baseScale,
      opacity: reducedMotion ? 0.72 : 0.82 + random() * 0.16,

      color: LAB_DOT_COLORS[index % LAB_DOT_COLORS.length]!,
      randomRadiusOffset: -18 + random() * 36,
      rotationOffset: random() * Math.PI * 2,
      pulseOffset: random() * Math.PI * 2,
      slipOffset: random() * Math.PI * 2
    };
  });
}
