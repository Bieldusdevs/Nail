import Image from "next/image";

const editorials = [
  {
    src: "/images/editorial-chrome.jpg",
    alt: "Mão com nail art cromada sobre tecido verde profundo",
    title: "Liquid metal",
    category: "Chrome study",
    dimensions: "w-[78vw] md:w-[52vw] lg:w-[38vw]",
  },
  {
    src: "/images/editorial-floral.jpg",
    alt: "Mãos com delicada nail art floral sobre vidro rosa",
    title: "Micro bloom",
    category: "Hand-painted",
    dimensions: "w-[78vw] md:w-[52vw] lg:w-[38vw]",
  },
  {
    src: "/images/editorial-red.jpg",
    alt: "Mãos com manicure curta em vermelho oxblood sobre linho cru",
    title: "Oxblood 03",
    category: "Colour notes",
    dimensions: "w-[78vw] md:w-[52vw] lg:w-[38vw]",
  },
] as const;

export function GallerySection() {
  return (
    <section
      className="min-h-screen overflow-hidden bg-[#ece9df] py-12 lg:py-0"
      data-gallery-section
      aria-labelledby="gallery-title"
    >
      <div className="page-gutter flex h-full min-h-screen flex-col justify-center">
        <div className="mb-10 flex items-end justify-between lg:mb-14">
          <div data-reveal>
            <p className="section-label">Caderno visual</p>
            <h2
              id="gallery-title"
              className="mt-6 text-[clamp(2.75rem,6vw,6rem)] font-light leading-none tracking-[-0.055em]"
            >
              Estudos recentes
            </h2>
          </div>
          <p className="hidden text-xs uppercase tracking-[0.06em] text-graphite lg:block">
            Arrasta para explorar — 01 / 03
          </p>
        </div>

        <div
          className="no-scrollbar w-full overflow-x-auto lg:overflow-visible"
          role="region"
          aria-label="Galeria de trabalhos recentes"
          tabIndex={0}
        >
          <div
            className="flex w-max snap-x snap-mandatory gap-4 pr-[var(--page-gutter)] md:gap-6"
            data-gallery-track
          >
            {editorials.map((editorial, index) => (
              <figure
                key={editorial.src}
                className={`${editorial.dimensions} shrink-0 snap-start`}
              >
                <div className="image-reveal relative aspect-[4/5] overflow-hidden bg-ash/20">
                  <Image
                    src={editorial.src}
                    alt={editorial.alt}
                    fill
                    sizes="(max-width: 767px) 78vw, (max-width: 1023px) 52vw, 38vw"
                    className="object-cover"
                    data-parallax
                  />
                </div>
                <figcaption className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-light tracking-[-0.03em]">
                      {editorial.title}
                    </h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.05em] text-graphite">
                      {editorial.category}
                    </p>
                  </div>
                  <span className="text-xs text-graphite">0{index + 1}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
