import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarDays, Clock3, UserRound } from "lucide-react";
import { nailProfessionals, nailServices } from "@/config/site";
import { formatCurrency, formatDuration } from "@/lib/utils";

interface BookingSummaryProps {
  serviceId: string;
  professionalId: string;
  date: string;
  time: string;
}

export function BookingSummary({
  serviceId,
  professionalId,
  date,
  time,
}: BookingSummaryProps) {
  const service = nailServices.find((item) => item.id === serviceId);
  const professional = nailProfessionals.find(
    (item) => item.id === professionalId,
  );
  const formattedDate = date
    ? format(parseISO(`${date}T12:00:00`), "EEEE, d 'de' MMMM", { locale: pt })
    : "Por escolher";

  return (
    <aside
      className="border border-ink/20 p-5 lg:sticky lg:top-6"
      aria-label="Resumo da marcação"
    >
      <div className="flex items-center justify-between border-b hairline pb-4">
        <h2 className="text-sm font-medium">A tua marcação</h2>
        <span className="text-[0.65rem] uppercase tracking-[0.07em] text-graphite">
          Resumo
        </span>
      </div>

      <dl className="divide-y divide-black/15">
        <div className="py-5">
          <dt className="flex items-center gap-3 text-xs text-graphite">
            <Clock3 className="size-4" strokeWidth={1.4} aria-hidden="true" />
            Serviço
          </dt>
          <dd className="mt-2 pl-7 text-sm">
            {service?.name ?? "Por escolher"}
          </dd>
          {service ? (
            <dd className="mt-1 pl-7 text-xs text-graphite">
              {formatDuration(service.durationMinutes)}
            </dd>
          ) : null}
        </div>
        <div className="py-5">
          <dt className="flex items-center gap-3 text-xs text-graphite">
            <UserRound
              className="size-4"
              strokeWidth={1.4}
              aria-hidden="true"
            />
            Artista
          </dt>
          <dd className="mt-2 pl-7 text-sm">
            {professional?.name ?? "Por escolher"}
          </dd>
        </div>
        <div className="py-5">
          <dt className="flex items-center gap-3 text-xs text-graphite">
            <CalendarDays
              className="size-4"
              strokeWidth={1.4}
              aria-hidden="true"
            />
            Data e hora
          </dt>
          <dd className="mt-2 pl-7 text-sm capitalize">{formattedDate}</dd>
          {time ? (
            <dd className="mt-1 pl-7 text-sm tabular-nums">{time}</dd>
          ) : null}
        </div>
      </dl>

      <div className="flex items-end justify-between border-t border-ink pt-5">
        <div>
          <p className="text-xs text-graphite">Total</p>
          <p className="mt-1 text-xs text-graphite">Pagamento no atelier</p>
        </div>
        <p className="text-2xl font-light tracking-[-0.04em]">
          {service ? formatCurrency(service.priceCents) : "—"}
        </p>
      </div>
    </aside>
  );
}
