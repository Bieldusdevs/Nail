import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label="Lume Atelier — página inicial"
    >
      <svg viewBox="0 0 44 44" className="size-10 shrink-0" aria-hidden="true">
        <circle
          cx="22"
          cy="22"
          r="21.25"
          fill={inverted ? "#fffef7" : "#080808"}
          stroke={inverted ? "#fffef7" : "#080808"}
          strokeWidth="1.5"
        />
        <path
          d="M14 13.5V30h12.7"
          fill="none"
          stroke={inverted ? "#080808" : "#fffef7"}
          strokeWidth="2"
        />
        <circle
          cx="29.5"
          cy="13.5"
          r="2.5"
          fill={inverted ? "#080808" : "#ffacea"}
        />
      </svg>
      <span className="sr-only sm:not-sr-only sm:text-[0.72rem] sm:font-medium sm:uppercase sm:leading-[1.15] sm:tracking-[0.06em]">
        Lume
        <br />
        Atelier
      </span>
    </Link>
  );
}
