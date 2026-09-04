type Gsap = typeof import("gsap").gsap;

export function createRevealAnimations(gsap: Gsap): void {
  gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
    gsap.fromTo(
      element,
      { y: 42, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 86%", once: true },
      },
    );
  });
}
