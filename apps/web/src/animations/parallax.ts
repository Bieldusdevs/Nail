type Gsap = typeof import("gsap").gsap;

export function createParallaxAnimations(gsap: Gsap): void {
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
    gsap.fromTo(
      element,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: element.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.7,
        },
      },
    );
  });
}
