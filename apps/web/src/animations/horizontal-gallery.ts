type Gsap = typeof import("gsap").gsap;

export function createHorizontalGallery(gsap: Gsap): void {
  const galleryTrack = document.querySelector<HTMLElement>(
    "[data-gallery-track]",
  );
  const gallerySection = document.querySelector<HTMLElement>(
    "[data-gallery-section]",
  );
  if (!galleryTrack || !gallerySection || window.innerWidth < 1024) return;

  const distance = () =>
    Math.max(0, galleryTrack.scrollWidth - window.innerWidth + 48);
  gsap.to(galleryTrack, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: gallerySection,
      start: "top top",
      end: () => `+=${distance()}`,
      scrub: 0.8,
      pin: true,
      invalidateOnRefresh: true,
    },
  });
}
