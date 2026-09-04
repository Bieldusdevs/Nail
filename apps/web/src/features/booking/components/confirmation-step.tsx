import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Check, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AppointmentConfirmation } from "@/types/booking";

interface ConfirmationStepProps {
  confirmation: AppointmentConfirmation;
  email: string;
}

export function ConfirmationStep({
  confirmation,
  email,
}: ConfirmationStepProps) {
  const startsAt = parseISO(confirmation.startsAt);

  return (
    <section
      className="mx-auto max-w-3xl py-8 text-center"
      aria-labelledby="confirmation-title"
    >
      <div
        className="mx-auto flex size-20 items-center justify-center rounded-full bg-mint"
        aria-hidden="true"
      >
        <Check className="size-8" strokeWidth={1.4} />
      </div>
      <p className="mt-8 text-[0.68rem] font-medium uppercase tracking-[0.09em] text-graphite">
        Marcação {confirmation.reference}
      </p>
      <h1
        id="confirmation-title"
        className="mt-5 text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] tracking-[-0.06em]"
      >
        Está marcado.
      </h1>
      <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-graphite">
        Esperamos por ti{" "}
        <strong className="font-medium text-ink">
          {format(startsAt, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: pt })}
        </strong>
        . Enviámos todos os detalhes para {email}.
      </p>

      <div className="mx-auto mt-10 flex max-w-md items-start gap-4 border-y hairline py-5 text-left">
        <Mail className="mt-0.5 size-5 shrink-0" strokeWidth={1.4} />
        <p className="text-sm leading-6 text-graphite">
          Se não encontrares a confirmação, verifica a pasta de spam. Podes
          alterar ou cancelar até 24 horas antes.
        </p>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild size="large">
          <Link href="/conta">Gerir marcação</Link>
        </Button>
        <Button asChild size="large" variant="outline">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    </section>
  );
}
