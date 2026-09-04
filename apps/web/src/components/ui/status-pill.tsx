import { cn } from "@/lib/utils";

interface StatusPillProps {
  children: React.ReactNode;
  tone?: "success" | "neutral" | "warning";
}

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-[0.68rem] font-medium uppercase tracking-[0.08em]",
        tone === "success" && "bg-mint text-ink",
        tone === "neutral" && "border border-ink/20 text-ink",
        tone === "warning" && "bg-yellow text-ink",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
