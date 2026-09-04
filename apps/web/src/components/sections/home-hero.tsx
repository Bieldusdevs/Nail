"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? false : { y: "105%" };

  return (
    <section aria-labelledby="home-title">
      <div className="page-gutter pb-7 pt-7 md:pb-10 md:pt-12">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-16">
          <p className="max-w-48 text-xs uppercase leading-[1.45] tracking-[0.06em] text-graphite">
            Técnica, cuidado
            <br />e expressão pessoal
          </p>
          <Link
            href="/reservar"
            className="group hidden items-center gap-3 text-sm sm:inline-flex"
          >
            Agenda aberta
            <span className="flex size-9 items-center justify-center rounded-full border border-ink/30 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
              <ArrowIcon />
            </span>
          </Link>
        </div>
        <h1 id="home-title" className="display-title uppercase">
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className="block whitespace-nowrap"
              initial={initial}
              animate={{ y: 0 }}
              transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
            >
              Arte à flor
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className="block whitespace-nowrap pl-[8vw]"
              initial={initial}
              animate={{ y: 0 }}
              transition={{
                duration: 1.05,
                delay: 0.09,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              da pele.
            </motion.span>
          </span>
        </h1>
      </div>

      <motion.div
        className="image-reveal relative h-[66svh] min-h-[32rem] overflow-hidden md:h-[76svh]"
        initial={shouldReduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.15, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <Image
          src="/images/hero-nail-art.jpg"
          alt="Mãos com manicure minimalista em tons nude e bordeaux sobre pedra natural"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="page-gutter absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 pb-7 text-bone md:pb-10">
          <div>
            <p className="mb-3 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-bone/75">
              Almada, Portugal
            </p>
            <p className="max-w-[19ch] text-[clamp(1.75rem,3.5vw,3.75rem)] font-light leading-[1.02] tracking-[-0.045em]">
              Um atelier para ideias que se usam.
            </p>
          </div>
          <p className="hidden max-w-52 text-right text-xs leading-5 text-bone/75 md:block">
            Manicure consciente.
            <br />
            Resultado verdadeiramente teu.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
