import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/arrow-icon";

export function AtelierSection() {
  return (
    <section
      id="atelier"
      className="page-gutter py-[var(--section-space)]"
      aria-labelledby="atelier-heading"
    >
      <div className="grid gap-16 lg:grid-cols-2 lg:items-end lg:gap-20">
        <div
          className="image-reveal relative aspect-[3/4] overflow-hidden lg:aspect-[4/5]"
          data-reveal
        >
          <Image
            src="/images/editorial-studio.jpg"
            alt="Interior sereno do Lume Atelier com mesa em pedra e luz natural"
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover"
            data-parallax
          />
          <span className="absolute left-5 top-5 rounded-pill bg-yellow px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.08em]">
            Almada
          </span>
        </div>

        <div className="pb-3" data-reveal>
          <p className="section-label">O atelier</p>
          <h2
            id="atelier-heading"
            className="editorial-heading mt-10 max-w-[12ch] text-balance"
          >
            Calma para criar. Rigor para cuidar.
          </h2>
          <div className="mt-10 grid gap-8 border-t hairline pt-6 sm:grid-cols-2">
            <p className="max-w-[31ch] text-sm leading-6 text-graphite">
              Criámos um espaço íntimo, luminoso e sem pressa. Cada marcação
              reserva tempo real para conversar, preparar e executar com
              precisão.
            </p>
            <div className="text-sm leading-6">
              <p>Terça — Sexta, 10:00–19:00</p>
              <p>Sábado, 09:00–18:00</p>
              <p className="mt-4 text-graphite">
                Rua Cândido dos Reis 42
                <br />
                Almada
              </p>
            </div>
          </div>
          <Link
            href="/reservar"
            className="group mt-10 inline-flex items-center gap-3 text-sm"
          >
            Encontrar o meu horário
            <span className="flex size-9 items-center justify-center rounded-full border border-ink/25 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
