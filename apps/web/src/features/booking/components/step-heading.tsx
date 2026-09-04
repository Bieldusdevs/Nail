interface StepHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function StepHeading({ eyebrow, title, description }: StepHeadingProps) {
  return (
    <div className="mb-10">
      <p className="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-graphite">
        {eyebrow}
      </p>
      <h2 className="text-[clamp(2.25rem,4.5vw,4.5rem)] font-light leading-[0.98] tracking-[-0.052em] text-balance">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-6 text-graphite">
        {description}
      </p>
    </div>
  );
}
