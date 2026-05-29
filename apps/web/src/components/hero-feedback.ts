import type {
  NotebookUploadStatus,
  UploadUiError,
} from "@/features/upload/notebook-upload.types";
import type { heroContent } from "@/lib/hero-content";

export type HeroAccent = "orange" | "green" | "red";
export type HeroPrimaryMode = "upload" | "loading" | "retry" | "success";

type HeroFeedbackStateInput = {
  content: typeof heroContent;
  status: NotebookUploadStatus | undefined;
  error: UploadUiError | null;
};

export type HeroFeedbackState = {
  accent: HeroAccent;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryMode: HeroPrimaryMode;
};

const HERO_LOGO_SRC_BY_ACCENT: Record<HeroAccent, string> = {
  orange: "/tumbfolio.svg",
  green: "/tumbfolio-green.svg",
  red: "/tumbfolio-red.svg",
};

export function getHeroAccent(
  status: NotebookUploadStatus | undefined,
): HeroAccent {
  if (status === "uploaded") return "green";
  if (status === "failed") return "red";
  return "orange";
}

export function getHeroFeedbackState(
  input: HeroFeedbackStateInput,
): HeroFeedbackState {
  const { content, status, error } = input;
  const accent = getHeroAccent(status);

  if (status === "failed" && error) {
    return {
      accent,
      title: error.title,
      subtitle: error.message,
      primaryLabel: "Reintentar",
      primaryMode: "retry",
    };
  }

  if (status === "uploaded") {
    return {
      accent,
      title: "Notebook listo para revisar",
      subtitle:
        "Tu notebook ya entró. En un momento te llevamos al resumen para validar y seguir.",
      primaryLabel: "Continuar",
      primaryMode: "success",
    };
  }

  if (
    status === "hashing" ||
    status === "initiating" ||
    status === "uploading" ||
    status === "completing"
  ) {
    return {
      accent,
      title: content.title,
      subtitle: content.subtitle,
      primaryLabel:
        status === "hashing" || status === "initiating"
          ? "Preparando…"
          : "Subiendo…",
      primaryMode: "loading",
    };
  }

  return {
    accent,
    title: content.title,
    subtitle: content.subtitle,
    primaryLabel: content.primaryCta,
    primaryMode: "upload",
  };
}

export function getHeroFadeSignature(feedback: HeroFeedbackState): string {
  return [
    feedback.accent,
    feedback.title,
    feedback.subtitle,
  ].join("::");
}

export function getHeroLogoSrc(accent: HeroAccent): string {
  return HERO_LOGO_SRC_BY_ACCENT[accent];
}
