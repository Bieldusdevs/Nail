import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter py-16 md:py-24"
    >
      <article className="mx-auto max-w-3xl">
        <p className="section-label">Informação legal</p>
        <h1 className="mt-8 text-[clamp(3.5rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
          Privacidade, sem letras pequenas.
        </h1>
        <p className="mt-8 text-sm text-graphite">
          Última atualização: 4 de setembro de 2026
        </p>
        <div className="mt-14 space-y-10 text-base leading-7">
          <section>
            <h2 className="text-2xl font-light">
              1. Responsável pelo tratamento
            </h2>
            <p className="mt-3 text-graphite">
              A Lume Atelier trata os dados necessários para criar contas, gerir
              marcações, comunicar alterações e cumprir obrigações legais.
              Contacto: privacidade@lumeatelier.pt.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-light">2. Dados e finalidades</h2>
            <p className="mt-3 text-graphite">
              Tratamos identificação, contacto, marcações e preferências
              fornecidas voluntariamente. A base jurídica é a execução do
              serviço, o cumprimento legal ou o consentimento, conforme
              aplicável.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-light">3. Conservação e segurança</h2>
            <p className="mt-3 text-graphite">
              Conservamos os dados apenas durante o período necessário.
              Aplicamos controlo de acesso, encriptação em trânsito, registos de
              auditoria e procedimentos de resposta a incidentes.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-light">4. Os teus direitos</h2>
            <p className="mt-3 text-graphite">
              Podes pedir acesso, retificação, apagamento, limitação, oposição
              ou portabilidade. Podes também reclamar junto da Comissão Nacional
              de Proteção de Dados.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
