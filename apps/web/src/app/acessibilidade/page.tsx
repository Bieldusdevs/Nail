import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acessibilidade" };

export default function AccessibilityPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter py-16 md:py-24"
    >
      <article className="mx-auto max-w-3xl">
        <p className="section-label">Acessibilidade</p>
        <h1 className="mt-8 text-[clamp(3.5rem,8vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
          Uma experiência para todas as pessoas.
        </h1>
        <div className="mt-12 space-y-6 leading-7 text-graphite">
          <p>
            Desenvolvemos esta experiência com referência às WCAG 2.2 nível AA:
            navegação por teclado, foco visível, semântica adequada, contraste e
            mensagens de erro associadas aos campos.
          </p>
          <p>
            As animações não essenciais são reduzidas quando o sistema indica{" "}
            <span className="font-mono text-sm text-ink">
              prefers-reduced-motion
            </span>
            . O zoom até 200% e os tamanhos de texto do navegador são
            suportados.
          </p>
          <p>
            Encontraste uma barreira? Escreve para{" "}
            <a
              href="mailto:acessibilidade@lumeatelier.pt"
              className="border-b border-ink text-ink"
            >
              acessibilidade@lumeatelier.pt
            </a>{" "}
            e indica a página e tecnologia de apoio utilizada.
          </p>
        </div>
      </article>
    </main>
  );
}
