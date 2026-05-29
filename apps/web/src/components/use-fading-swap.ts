"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type UseFadingSwapOptions<T> = {
  durationMs: number;
  getSignature?: (value: T) => string;
  value: T;
};

type FadingSwapPhase = "idle" | "fading-out" | "fading-in";

type UseFadingSwapResult<T> = {
  currentValue: T;
  currentVisible: boolean;
  previousValue: T | null;
  previousVisible: boolean;
  transitionPhase: FadingSwapPhase;
  transitionState: "idle" | "fading";
};

export function useFadingSwap<T>({
  durationMs,
  getSignature,
  value,
}: UseFadingSwapOptions<T>): UseFadingSwapResult<T> {
  const signature = useMemo(
    () => (getSignature ? getSignature(value) : JSON.stringify(value)),
    [getSignature, value],
  );
  const [currentValue, setCurrentValue] = useState(value);
  const [currentSignature, setCurrentSignature] = useState(signature);
  const [currentVisible, setCurrentVisible] = useState(true);
  const [previousValue, setPreviousValue] = useState<T | null>(null);
  const [previousVisible, setPreviousVisible] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<FadingSwapPhase>("idle");
  const enterTimeoutRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);
  const exitFrameRef = useRef<number | null>(null);

  function clearScheduledTransition() {
    if (enterTimeoutRef.current !== null) {
      window.clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (enterFrameRef.current !== null) {
      window.cancelAnimationFrame(enterFrameRef.current);
      enterFrameRef.current = null;
    }

    if (exitFrameRef.current !== null) {
      window.cancelAnimationFrame(exitFrameRef.current);
      exitFrameRef.current = null;
    }
  }

  useLayoutEffect(() => {
    if (currentSignature === signature) {
      setCurrentValue(value);
      return;
    }

    clearScheduledTransition();
    setPreviousValue(currentValue);
    setPreviousVisible(true);
    setCurrentValue(value);
    setCurrentSignature(signature);
    setCurrentVisible(false);
    setTransitionPhase("fading-out");

    exitFrameRef.current = window.requestAnimationFrame(() => {
      setPreviousVisible(false);
      exitFrameRef.current = null;
    });

    exitTimeoutRef.current = window.setTimeout(() => {
      setPreviousValue(null);
      setTransitionPhase("fading-in");

      enterFrameRef.current = window.requestAnimationFrame(() => {
        setCurrentVisible(true);
        enterFrameRef.current = null;
      });

      enterTimeoutRef.current = window.setTimeout(() => {
        setTransitionPhase("idle");
        enterTimeoutRef.current = null;
      }, durationMs);
    }, durationMs);
  }, [
    currentSignature,
    currentValue,
    durationMs,
    signature,
    value,
  ]);

  useEffect(() => {
    return () => {
      clearScheduledTransition();
    };
  }, []);

  return {
    currentValue,
    currentVisible,
    previousValue,
    previousVisible,
    transitionPhase,
    transitionState: transitionPhase === "idle" ? "idle" : "fading",
  };
}
