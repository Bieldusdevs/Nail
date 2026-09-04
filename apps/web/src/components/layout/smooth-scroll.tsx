"use client";

import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let cleanup = () => undefined;
    void import("lenis").then(({ default: Lenis }) => {
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
      });
      let frameId = 0;
      const frame = (time: number) => {
        lenis.raf(time);
        frameId = requestAnimationFrame(frame);
      };
      frameId = requestAnimationFrame(frame);
      cleanup = () => {
        cancelAnimationFrame(frameId);
        lenis.destroy();
      };
    });

    return () => cleanup();
  }, []);

  return null;
}
