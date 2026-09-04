export function TestimonialSection() {
  return (
    <section
      className="page-gutter bg-navy py-20 text-bone md:py-28"
      aria-label="Testemunho de cliente"
    >
      <div className="grid gap-12 md:grid-cols-12" data-reveal>
        <div className="md:col-span-3">
          <p className="section-label !text-bone/60">Notas de quem vem</p>
        </div>
        <figure className="md:col-span-9">
          <blockquote className="max-w-[19ch] text-[clamp(2.35rem,5.3vw,6rem)] font-light leading-[0.98] tracking-[-0.055em] text-balance">
            “Saio sempre com algo que parece mesmo meu — nunca uma cópia.”
          </blockquote>
          <figcaption className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.07em] text-bone/65">
            <span className="size-2 rounded-full bg-pink" />
            Carolina, cliente desde 2024
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
