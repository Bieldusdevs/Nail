import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-gutter flex min-h-[65vh] items-center py-16"
    >
      <div>
        <p className="section-label">Erro 404</p>
        <h1 className="mt-8 text-[clamp(5rem,18vw,15rem)] font-light leading-[0.75] tracking-[-0.08em]">
          Fora da linha.
        </h1>
        <p className="mt-10 max-w-md text-sm leading-6 text-graphite">
          Esta página já não existe ou mudou de lugar.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  );
}
