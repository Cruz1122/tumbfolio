"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { HeroVisual } from "@/components/HeroVisual";
import {
  ErrorIcon,
  LoadingIcon,
  SuccessIcon,
  UploadIcon,
} from "@/components/Icons";
import {
  getHeroFadeSignature,
  getHeroFeedbackState,
  getHeroLogoSrc,
  type HeroAccent,
  type HeroFeedbackState,
} from "@/components/hero-feedback";
import { useFadingSwap } from "@/components/use-fading-swap";
import type {
  NotebookUploadStatus,
  UploadUiError,
} from "@/features/upload/notebook-upload.types";
import type { heroContent } from "@/lib/hero-content";

type UploadState = {
  status: NotebookUploadStatus;
  progress: number;
  selectedFile: File | null;
  error: UploadUiError | null;
  isBusy: boolean;
};

interface HeroProps {
  content: typeof heroContent;
  onUploadNotebook?: (file: File) => Promise<void>;
  uploadState?: UploadState;
}

type HeroLayerProps = {
  content: typeof heroContent;
  feedback: HeroFeedbackState;
  isActive: boolean;
  isBusy: boolean;
  onPrimaryAction: () => void;
  visualTransition?: "normal" | "fade-out";
};

const HERO_LOGO_VARIANTS = [
  "/tumbfolio.svg",
  "/tumbfolio-green.svg",
  "/tumbfolio-red.svg",
] as const;
const HERO_FEEDBACK_FADE_MS = 150;

let heroLogosPreloaded = false;

function accentText(accent: HeroAccent): string {
  if (accent === "green") return "text-green-600";
  if (accent === "red") return "text-red-600";
  return "text-orange-600";
}

function accentButton(accent: HeroAccent): string {
  if (accent === "green") return "bg-green-600 hover:bg-green-700";
  if (accent === "red") return "bg-red-600 hover:bg-red-700";
  return "bg-[var(--tumbfolio-orange)] hover:bg-[var(--tumbfolio-orange-dark)]";
}

function accentTitle(accent: HeroAccent): string {
  if (accent === "green") return "text-green-700";
  if (accent === "red") return "text-red-700";
  return "text-gray-950";
}

function accentSubtitle(accent: HeroAccent): string {
  if (accent === "green") return "text-green-600";
  if (accent === "red") return "text-red-600";
  return "text-gray-600";
}

function HeroFeedbackLayer({
  content,
  feedback,
  isActive,
  isBusy,
  onPrimaryAction,
  visualTransition = "normal",
}: HeroLayerProps) {
  const logoSrc = getHeroLogoSrc(feedback.accent);
  const titleClassName = accentTitle(feedback.accent);
  const subtitleClassName = accentSubtitle(feedback.accent);
  const primaryButtonClassName = accentButton(feedback.accent);
  const secondaryButtonClassName = "button-secondary";

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        data-logo-src={logoSrc}
        data-testid={isActive ? "hero-logo" : undefined}
        data-tone={feedback.accent}
        className="relative flex items-center justify-center"
      >
        <Image
          alt={isActive ? "Tumbfolio" : ""}
          aria-hidden={!isActive}
          className="h-auto w-auto max-h-48 object-contain sm:max-h-56"
          height={288}
          priority={isActive}
          src={logoSrc}
          unoptimized
          width={288}
        />
      </div>

      <h1
        className="mt-7 max-w-5xl text-4xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-5xl lg:text-[3.75rem]"
        data-testid={isActive ? "hero-title" : undefined}
      >
        <span className={titleClassName}>{feedback.title}</span>
      </h1>

      <p
        className="mt-6 max-w-3xl text-base leading-8 sm:text-xl"
        data-testid={isActive ? "hero-subtitle" : undefined}
      >
        <span className={subtitleClassName}>{feedback.subtitle}</span>
      </p>

      <div
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        data-testid={!isActive ? "hero-previous-copy" : undefined}
        data-visual-transition={!isActive ? visualTransition : undefined}
      >
        <button
          data-testid={isActive ? "hero-primary-cta" : undefined}
          type="button"
          className={`min-w-44 rounded-full px-6 py-3 text-sm font-semibold text-white transition inline-flex items-center justify-center gap-2 disabled:cursor-default disabled:opacity-100 ${primaryButtonClassName}`}
          disabled={!isActive || isBusy || feedback.primaryMode === "success"}
          onClick={isActive && feedback.primaryMode !== "success" ? onPrimaryAction : undefined}
        >
          {feedback.primaryMode === "retry" ? (
            <ErrorIcon className="text-[1.05rem] shrink-0" />
          ) : feedback.primaryMode === "success" ? (
            <SuccessIcon className="text-[1.05rem] shrink-0" />
          ) : feedback.primaryMode === "loading" ? (
            <LoadingIcon className="animate-spin text-[1.05rem] shrink-0" />
          ) : (
            <UploadIcon className="text-[1.05rem] shrink-0" />
          )}
          <span>{feedback.primaryLabel}</span>
        </button>
        <Link
          className={`${secondaryButtonClassName} min-w-44 px-6 py-3 text-sm font-semibold`}
          href="/present"
          tabIndex={isActive ? 0 : -1}
        >
          {content.secondaryCta}
        </Link>
      </div>
    </div>
  );
}

export function Hero({ content, onUploadNotebook, uploadState }: HeroProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const status = uploadState?.status;
  const isBusy = uploadState?.isBusy ?? false;
  const canClick = !isBusy || status === "failed";
  const feedback = useMemo(
    () =>
      getHeroFeedbackState({
        content,
        status,
        error: uploadState?.error ?? null,
      }),
    [content, status, uploadState?.error],
  );
  const {
    currentValue: displayedFeedback,
    currentVisible: isCurrentFeedbackVisible,
    previousValue: previousFeedback,
    previousVisible: isPreviousFeedbackVisible,
    transitionPhase,
    transitionState,
  } = useFadingSwap({
    value: feedback,
    durationMs: HERO_FEEDBACK_FADE_MS,
    getSignature: getHeroFadeSignature,
  });

  useEffect(() => {
    if (heroLogosPreloaded) {
      return;
    }

    heroLogosPreloaded = true;

    for (const src of HERO_LOGO_VARIANTS) {
      const image = new window.Image();
      image.src = src;
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;
      const file = e.dataTransfer.files.item(0);
      if (file && onUploadNotebook) {
        void onUploadNotebook(file);
      }
    },
    [onUploadNotebook],
  );

  const handleClick = useCallback(() => {
    if (!canClick) return;
    fileInputRef.current?.click();
  }, [canClick]);

  return (
    <section
      className="relative isolate overflow-hidden"
      data-accent={displayedFeedback.accent}
      data-testid="hero"
      id="top"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative min-h-[100svh] px-6 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12 lg:pb-24 lg:pt-14">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ipynb,application/json,application/x-ipynb+json"
          className="sr-only"
          disabled={isBusy}
          onChange={(e) => {
            const file = e.target.files?.item(0);
            if (file && onUploadNotebook) {
              void onUploadNotebook(file);
            }
            e.currentTarget.value = "";
          }}
        />

        <HeroVisual isDragging={isDragging} accent={displayedFeedback.accent} />

        <div
          className={`fixed inset-0 z-20 flex flex-col items-center justify-center text-center transition-opacity duration-150 ${
            isDragging ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <UploadIcon className={`text-6xl ${accentText(displayedFeedback.accent)}`} />
            <p className={`text-lg font-semibold ${accentText(displayedFeedback.accent)}`}>
              Suelta tu notebook .ipynb aquí
            </p>
          </div>
        </div>

        <div className="relative z-10 mx-auto min-h-[76svh] max-w-5xl">
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-150 ${
              isDragging ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div
              className="hero-reveal relative w-full"
              data-current-accent={displayedFeedback.accent}
              data-previous-accent={previousFeedback?.accent ?? undefined}
              data-transition-phase={transitionPhase}
              data-testid="hero-feedback"
              data-transition-state={transitionState}
              style={{ animationDelay: "40ms" }}
            >
              {previousFeedback ? (
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-[150ms] ${
                    isPreviousFeedbackVisible ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <HeroFeedbackLayer
                    content={content}
                    feedback={previousFeedback}
                    isActive={false}
                    isBusy={isBusy}
                    onPrimaryAction={handleClick}
                    visualTransition="fade-out"
                  />
                </div>
              ) : null}

              {/*
                Keep the incoming layer fully hidden during fade-out so recycled DOM state
                does not briefly paint the new content before the crossfade starts.
              */}
              <div
                className={`${
                  transitionPhase === "fading-out"
                    ? "opacity-0 duration-0"
                    : "transition-opacity duration-[150ms]"
                } ${
                  isCurrentFeedbackVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <HeroFeedbackLayer
                  content={content}
                  feedback={displayedFeedback}
                  isActive
                  isBusy={isBusy}
                  onPrimaryAction={handleClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
