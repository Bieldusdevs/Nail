"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter flex min-h-[65vh] items-center py-16"
    >
      <div>
        <p className="section-label">Algo não correu como esperado</p>
        <h1 className="mt-8 max-w-[12ch] text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.88] tracking-[-0.065em]">
          Vamos tentar outra vez.
        </h1>
        <p className="mt-8 max-w-md text-sm leading-6 text-graphite">
          O incidente recebeu um identificador interno. Nenhum detalhe técnico
          foi exposto.
        </p>
        <Button type="button" onClick={reset} className="mt-8">
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
