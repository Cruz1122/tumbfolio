import { describe, expect, it } from "vitest";

import { heroContent } from "../lib/hero-content";
import {
  getHeroFadeSignature,
  getHeroFeedbackState,
  getHeroLogoSrc,
} from "./hero-feedback";

describe("getHeroFeedbackState", () => {
  it("returns the default copy and orange accent while idle", () => {
    const state = getHeroFeedbackState({
      content: heroContent,
      status: "idle",
      error: null,
    });

    expect(state.accent).toBe("orange");
    expect(state.title).toBe(heroContent.title);
    expect(state.subtitle).toBe(heroContent.subtitle);
    expect(state.primaryLabel).toBe(heroContent.primaryCta);
    expect(state.primaryMode).toBe("upload");
  });

  it("replaces the central copy with the upload error and switches to red", () => {
    const state = getHeroFeedbackState({
      content: heroContent,
      status: "failed",
      error: {
        code: "UPLOAD_COMPLETE_FAILED",
        title: "No pudimos cargar este notebook",
        message: "Revisa el archivo e inténtalo otra vez.",
      },
    });

    expect(state.accent).toBe("red");
    expect(state.title).toBe("No pudimos cargar este notebook");
    expect(state.subtitle).toBe("Revisa el archivo e inténtalo otra vez.");
    expect(state.primaryLabel).toBe("Reintentar");
    expect(state.primaryMode).toBe("retry");
  });

  it("shows the success copy in the central block and switches to green", () => {
    const state = getHeroFeedbackState({
      content: heroContent,
      status: "uploaded",
      error: null,
    });

    expect(state.accent).toBe("green");
    expect(state.title).toBe("Notebook listo para revisar");
    expect(state.subtitle).toBe(
      "Tu notebook ya entró. En un momento te llevamos al resumen para validar y seguir.",
    );
    expect(state.primaryLabel).toBe("Continuar");
    expect(state.primaryMode).toBe("success");
  });

  it("maps each accent to its cached public svg variant", () => {
    expect(getHeroLogoSrc("orange")).toBe("/tumbfolio.svg");
    expect(getHeroLogoSrc("green")).toBe("/tumbfolio-green.svg");
    expect(getHeroLogoSrc("red")).toBe("/tumbfolio-red.svg");
  });

  it("keeps the same fade signature across internal loading label changes", () => {
    const preparingState = getHeroFeedbackState({
      content: heroContent,
      status: "initiating",
      error: null,
    });
    const uploadingState = getHeroFeedbackState({
      content: heroContent,
      status: "uploading",
      error: null,
    });

    expect(preparingState.primaryLabel).not.toBe(uploadingState.primaryLabel);
    expect(preparingState.primaryMode).toBe(uploadingState.primaryMode);
    expect(getHeroFadeSignature(preparingState)).toBe(
      getHeroFadeSignature(uploadingState),
    );
  });
});
