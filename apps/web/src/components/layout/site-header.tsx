import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { MenuOverlay } from "@/components/layout/menu-overlay";

export function SiteHeader() {
  return (
    <header
      className="relative z-40 h-[var(--header-height)] bg-bone"
      data-header
    >
      <div className="page-gutter grid h-full grid-cols-[1fr_auto_1fr] items-center">
        <Logo />
        <p className="hidden text-center text-[0.65rem] font-medium uppercase leading-[1.3] tracking-[0.07em] md:block">
          Nail artistry &amp; cuidado
          <br />
          Almada — Portugal
        </p>
        <div className="justify-self-end">
          <div className="flex items-center gap-3">
            <Link
              href="/reservar"
              className="link-underline hidden text-sm lg:inline-flex"
            >
              Fazer marcação
            </Link>
            <MenuOverlay />
          </div>
        </div>
      </div>
    </header>
  );
}
