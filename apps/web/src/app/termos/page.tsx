import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Serviço" };

export default function TermsPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter py-16 md:py-24"
    >
      <article className="mx-auto max-w-3xl">
        <p className="section-label">Informação legal</p>
        <h1 className="mt-8 text-[clamp(3.5rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
          Termos claros, relações simples.
        </h1>
        <div className="mt-14 space-y-10 leading-7 text-graphite">
          <section>
            <h2 className="text-2xl font-light text-ink">Marcações</h2>
            <p className="mt-3">
              A marcação fica confirmada após receberes a referência por email.
              Confirma o serviço, duração e preço antes de concluir.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-light text-ink">
              Alterações e cancelamentos
            </h2>
            <p className="mt-3">
              Podes alterar ou cancelar sem custo até 24 horas antes.
              Cancelamentos tardios e faltas podem implicar um sinal numa
              marcação futura.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-light text-ink">Saúde e segurança</h2>
            <p className="mt-3">
              Informa a artista sobre alergias, sensibilidades ou alterações
              relevantes. Podemos recusar o serviço quando existam sinais que
              recomendem avaliação clínica.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
