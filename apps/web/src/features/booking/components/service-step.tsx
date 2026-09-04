import { Check } from "lucide-react";
import { StepHeading } from "@/features/booking/components/step-heading";
import { nailServices } from "@/config/site";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";

interface ServiceStepProps {
  value: string;
  onChange: (serviceId: string) => void;
}

const accentClasses = {
  mint: "peer-checked:bg-mint",
  blue: "peer-checked:bg-powder",
  pink: "peer-checked:bg-pink",
  navy: "peer-checked:bg-navy peer-checked:text-bone",
} as const;

export function ServiceStep({ value, onChange }: ServiceStepProps) {
  return (
    <fieldset>
      <legend className="sr-only">Escolhe um serviço</legend>
      <StepHeading
        eyebrow="Passo 1 de 4"
        title="O que vamos criar?"
        description="O preço indicado inclui preparação, acabamento e remoção do nosso trabalho anterior. Nail art complexa pode exigir tempo adicional."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {nailServices.map((service) => {
          const checked = value === service.id;
          return (
            <label key={service.id} className="relative cursor-pointer">
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={checked}
                onChange={() => onChange(service.id)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex min-h-64 flex-col border border-ink/20 p-5 transition-[background,color,border-color,transform] duration-300 hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-magenta peer-checked:border-ink",
                  accentClasses[service.accent],
                )}
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="text-[0.68rem] uppercase tracking-[0.07em] opacity-65">
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border border-current/35 transition-opacity",
                      checked ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  >
                    <Check className="size-3.5" strokeWidth={1.7} />
                  </span>
                </span>
                <span className="mt-auto">
                  <span className="block text-[clamp(1.55rem,2.5vw,2.35rem)] font-light leading-none tracking-[-0.045em]">
                    {service.name}
                  </span>
                  <span className="mt-3 block text-sm leading-5 opacity-65">
                    {service.description}
                  </span>
                  <span className="mt-5 block text-sm font-medium">
                    {formatCurrency(service.priceCents)}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
