import Link from "next/link";
import { ArrowIcon } from "@/components/ui/arrow-icon";

const principles = [
  [
    "01",
    "Biossegurança",
    "Instrumentos esterilizados e protocolos rigorosos em cada sessão.",
  ],
  [
    "02",
    "Autoria",
    "Cada composição nasce da tua referência e da linguagem da nossa artista.",
  ],
  [
    "03",
    "Cuidado",
    "Produtos selecionados para respeitar a saúde da unha natural.",
  ],
] as const;

export function IntroSection() {
  return (
    <section
      className="page-gutter py-[var(--section-space)]"
      aria-labelledby="intro-heading"
    >
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <p className="section-label lg:col-span-3" data-reveal>
          O nosso gesto
        </p>
        <div className="lg:col-span-9">
          <h2
            id="intro-heading"
            className="editorial-heading max-w-[19ch] text-balance"
            data-reveal
          >
            Unhas como superfície criativa. Cuidado como ponto de partida.
          </h2>
          <div
            className="mt-14 grid gap-8 border-t hairline pt-6 md:grid-cols-3 md:gap-10"
            data-reveal
          >
            {principles.map(([number, title, description]) => (
              <article key={number}>
                <div className="mb-10 flex items-center justify-between text-xs text-graphite">
                  <span>{number}</span>
                  <span className="size-1.5 rounded-full bg-ink" />
                </div>
                <h3 className="text-lg font-normal tracking-[-0.025em]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[31ch] text-sm leading-6 text-graphite">
                  {description}
                </p>
              </article>
            ))}
          </div>
          <Link
            href="/reservar"
            className="group mt-12 inline-flex items-center gap-3 text-sm"
            data-reveal
          >
            Descobrir uma sessão
            <span className="flex size-9 items-center justify-center rounded-full border border-ink/25 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
