import { cn } from "@/lib/utils";

interface ArrowIconProps {
  className?: string;
  direction?: "right" | "left" | "down";
}

export function ArrowIcon({ className, direction = "right" }: ArrowIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={cn(
        "size-4 transition-transform duration-300",
        direction === "left" && "rotate-180",
        direction === "down" && "rotate-90",
        className,
      )}
      aria-hidden="true"
    >
      <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
