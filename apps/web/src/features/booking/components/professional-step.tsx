import { Check } from "lucide-react";
import { nailProfessionals } from "@/config/site";
import { StepHeading } from "@/features/booking/components/step-heading";
import { cn } from "@/lib/utils";

interface ProfessionalStepProps {
  value: string;
  onChange: (professionalId: string) => void;
}

export function ProfessionalStep({ value, onChange }: ProfessionalStepProps) {
  return (
    <fieldset>
      <legend className="sr-only">Escolhe uma artista</legend>
      <StepHeading
        eyebrow="Passo 2 de 4"
        title="Com quem queres marcar?"
        description="Todas as nossas artistas seguem o mesmo protocolo de cuidado. Podes escolher alguém ou deixar-nos encontrar o primeiro horário livre."
      />
      <div className="border-t border-ink">
        {nailProfessionals.map((professional) => {
          const checked = value === professional.id;
          return (
            <label
              key={professional.id}
              className="relative block cursor-pointer"
            >
              <input
                type="radio"
                name="professional"
                value={professional.id}
                checked={checked}
                onChange={() => onChange(professional.id)}
                className="peer sr-only"
              />
              <span className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-4 border-b hairline px-1 py-5 transition-colors hover:bg-black/[0.035] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-magenta peer-checked:bg-mint md:grid-cols-[4rem_1fr_1fr_auto] md:px-4">
                <span className="flex size-10 items-center justify-center rounded-full border border-ink/30 text-xs">
                  {professional.initials}
                </span>
                <span className="text-lg font-light tracking-[-0.025em]">
                  {professional.name}
                </span>
                <span className="hidden text-sm text-graphite md:block">
                  {professional.specialty}
                </span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border border-ink/30 transition-opacity",
                    checked ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                >
                  <Check className="size-3.5" />
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
