import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { siteConfig } from "@/config/site";

const footerNavigation = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/reservar", label: "Marcações" },
  { href: "/conta", label: "A minha conta" },
  { href: "/entrar", label: "Entrar" },
];

const legalNavigation = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos" },
  { href: "/acessibilidade", label: "Acessibilidade" },
];

export function SiteFooter() {
  return (
    <footer className="page-gutter border-t hairline pb-8 pt-10 md:pt-16">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-10 max-w-[18ch] text-[clamp(2rem,4vw,4.25rem)] font-light leading-[0.98] tracking-[-0.05em]">
            A tua próxima ideia começa aqui.
          </p>
          <Link
            href="/reservar"
            className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm"
          >
            Fazer uma marcação <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-10 text-sm sm:grid-cols-3 md:col-span-7">
          <div>
            <p className="mb-5 text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
              Visita-nos
            </p>
            <address className="not-italic leading-6">
              Rua Cândido dos Reis 42
              <br />
              2800-270 Almada
              <br />
              Portugal
            </address>
          </div>
          <nav aria-label="Rodapé">
            <p className="mb-5 text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
              Explorar
            </p>
            <ul className="space-y-2.5">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link className="link-underline" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-5 text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
              Contacto
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  className="link-underline"
                  href={`mailto:${siteConfig.email}`}
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  className="link-underline"
                  href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  className="link-underline"
                  href="https://www.instagram.com"
                  rel="noreferrer"
                >
                  {siteConfig.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-5 border-t hairline pt-5 text-[0.68rem] uppercase tracking-[0.06em] text-graphite sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Lume Atelier</p>
        <nav aria-label="Informação legal">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNavigation.map((item) => (
              <li key={item.href}>
                <Link className="link-underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
