import Link from "next/link";
import { ArrowIcon } from "@/components/ui/arrow-icon";

export function BookingCta() {
  return (
    <section
      className="overflow-hidden py-[var(--section-space)]"
      aria-labelledby="booking-cta-title"
    >
      <div className="page-gutter">
        <p className="section-label" data-reveal>
          Próximo passo
        </p>
        <div className="mt-10 border-y border-ink py-8 md:py-10" data-reveal>
          <Link
            href="/reservar"
            className="group flex items-center justify-between gap-8"
          >
            <h2
              id="booking-cta-title"
              className="text-[clamp(3.35rem,10vw,11rem)] font-light uppercase leading-[0.82] tracking-[-0.07em]"
            >
              Marcar sessão
            </h2>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-[-35deg] md:size-20">
              <ArrowIcon className="size-6 md:size-8" />
            </span>
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3 text-xs uppercase tracking-[0.06em] text-graphite">
          <p>Confirmação imediata</p>
          <p>Alterações até 24h antes</p>
        </div>
      </div>
    </section>
  );
}
