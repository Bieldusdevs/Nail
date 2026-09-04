import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  className?: string;
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-8 md:space-y-12", className)} data-reveal>
      <p className="section-label">{eyebrow}</p>
      <h2
        className={cn(
          "editorial-heading max-w-[16ch] text-balance",
          titleClassName,
        )}
      >
        {title}
      </h2>
    </div>
  );
}
