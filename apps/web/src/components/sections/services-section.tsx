import Link from "next/link";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { nailServices } from "@/config/site";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";

const accentClasses = {
  mint: "hover:bg-mint",
  blue: "hover:bg-powder",
  pink: "hover:bg-pink",
  navy: "hover:bg-navy hover:text-bone",
} as const;

export function ServicesSection() {
  return (
    <section
      id="servicos"
      className="page-gutter pb-[var(--section-space)]"
      aria-labelledby="services-heading"
    >
      <div className="flex items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Menu de serviços"
          title="Escolhe o tempo e o detalhe que queres dedicar a ti."
          titleClassName="max-w-[17ch]"
        />
        <Link
          href="/reservar"
          className="mb-2 hidden items-center gap-2 text-sm md:inline-flex"
        >
          Ver disponibilidade <ArrowIcon />
        </Link>
      </div>

      <div className="mt-16 border-t border-ink" data-reveal>
        {nailServices.map((service, index) => (
          <Link
            key={service.id}
            href={`/reservar?servico=${service.slug}`}
            className={cn(
              "group grid gap-5 border-b hairline px-2 py-6 transition-colors duration-500 md:grid-cols-[4rem_minmax(12rem,0.9fr)_minmax(15rem,1.2fr)_auto] md:items-center md:px-5 md:py-8",
              accentClasses[service.accent],
            )}
          >
            <span className="text-xs text-graphite transition-colors group-hover:text-current">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[clamp(1.65rem,3vw,3rem)] font-light leading-none tracking-[-0.045em]">
              {service.name}
            </h3>
            <p className="max-w-md text-sm leading-6 text-graphite transition-colors group-hover:text-current md:px-6">
              {service.description}
            </p>
            <div className="flex items-center justify-between gap-8 md:justify-end">
              <p className="whitespace-nowrap text-xs uppercase tracking-[0.05em]">
                {formatDuration(service.durationMinutes)} ·{" "}
                {formatCurrency(service.priceCents)}
              </p>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-current/30 transition-transform duration-500 group-hover:rotate-[-35deg]">
                <ArrowIcon />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
