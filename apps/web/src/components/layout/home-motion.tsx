"use client";

import { useEffect } from "react";

export function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let revert: () => void = () => undefined;

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("@/animations/reveal"),
      import("@/animations/parallax"),
      import("@/animations/horizontal-gallery"),
    ]).then(
      ([
        gsapModule,
        scrollTriggerModule,
        revealModule,
        parallaxModule,
        galleryModule,
      ]) => {
        const gsap = gsapModule.gsap;
        gsap.registerPlugin(scrollTriggerModule.ScrollTrigger);
        const context = gsap.context(() => {
          revealModule.createRevealAnimations(gsap);
          parallaxModule.createParallaxAnimations(gsap);
          galleryModule.createHorizontalGallery(gsap);
        });
        revert = () => context.revert();
      },
    );

    return () => revert();
  }, []);

  return null;
}
