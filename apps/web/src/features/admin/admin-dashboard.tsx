"use client";

import { addDays, format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { ApiError } from "@/services/api-client";
import { listAdminAppointments } from "@/services/admin-service";

interface DemoBooking {
  id: string;
  time: string;
  customer: string;
  service: string;
  artist: string;
  status: "Confirmada" | "Concluída" | "Cancelada";
}

const demoBookings: DemoBooking[] = [
  {
    id: "LM-42F8A1",
    time: "09:30",
    customer: "Sofia Costa",
    service: "Manicure Signature",
    artist: "Inês",
    status: "Confirmada",
  },
  {
    id: "LM-13CE92",
    time: "11:00",
    customer: "Rita Matos",
    service: "Nail Art Editorial",
    artist: "Marta",
    status: "Confirmada",
  },
  {
    id: "LM-8B2D10",
    time: "14:00",
    customer: "Ana Pires",
    service: "Gel Natural",
    artist: "Leonor",
    status: "Confirmada",
  },
  {
    id: "LM-719DA3",
    time: "15:30",
    customer: "Madalena Reis",
    service: "Ritual de Mãos",
    artist: "Inês",
    status: "Concluída",
  },
  {
    id: "LM-9AC612",
    time: "17:00",
    customer: "Joana Luz",
    service: "Gel Natural",
    artist: "Marta",
    status: "Cancelada",
  },
];

export function AdminDashboard() {
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<DemoBooking[]>(
    demoMode ? demoBookings : [],
  );
  const [loading, setLoading] = useState(!demoMode);
  const [loadError, setLoadError] = useState("");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (demoMode) return;
    void listAdminAppointments()
      .then((page) => {
        const statusLabels = {
          PENDING: "Confirmada",
          CONFIRMED: "Confirmada",
          CANCELLED: "Cancelada",
          COMPLETED: "Concluída",
          NO_SHOW: "Cancelada",
        } as const;
        setBookings(
          page.content.map((appointment) => ({
            id: appointment.reference,
            time: format(new Date(appointment.startsAt), "HH:mm"),
            customer: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
            service: appointment.service.name,
            artist:
              appointment.professional.name.split(" ")[0] ??
              appointment.professional.name,
            status: statusLabels[appointment.status],
          })),
        );
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/entrar");
          return;
        }
        setLoadError("Não foi possível carregar a agenda.");
      })
      .finally(() => setLoading(false));
  }, [demoMode, router]);

  const filteredBookings = bookings.filter((booking) =>
    `${booking.customer} ${booking.service} ${booking.id}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="page-gutter pb-24 pt-8 md:pt-12">
      <div className="flex flex-col gap-6 border-b border-ink pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
            <ShieldCheck className="size-3.5" /> Área protegida · MFA ativo
          </div>
          <h1 className="mt-4 text-[clamp(3rem,6vw,6rem)] font-light leading-[0.9] tracking-[-0.06em]">
            Hoje no Lume.
          </h1>
          <p className="mt-4 text-sm capitalize text-graphite">
            {format(today, "EEEE, d 'de' MMMM", { locale: pt })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="size-4" /> Exportar
          </Button>
          <Button>
            <CalendarDays className="size-4" /> Nova marcação
          </Button>
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[12rem_1fr] lg:gap-14">
        <aside>
          <nav aria-label="Administração">
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="#resumo"
                  className="flex justify-between border-b border-ink py-3 font-medium"
                >
                  Resumo <span>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="#agenda"
                  className="flex justify-between border-b hairline py-3 text-graphite"
                >
                  Agenda <span>05</span>
                </a>
              </li>
              <li>
                <a
                  href="#clientes"
                  className="flex justify-between border-b hairline py-3 text-graphite"
                >
                  Clientes <span>428</span>
                </a>
              </li>
              <li>
                <a
                  href="#equipa"
                  className="flex justify-between border-b hairline py-3 text-graphite"
                >
                  Equipa <span>03</span>
                </a>
              </li>
              <li>
                <a
                  href="#servicos"
                  className="flex justify-between border-b hairline py-3 text-graphite"
                >
                  Serviços
                </a>
              </li>
              <li>
                <a
                  href="#auditoria"
                  className="flex justify-between border-b hairline py-3 text-graphite"
                >
                  Auditoria
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">
          <section id="resumo" aria-labelledby="summary-title">
            <h2 id="summary-title" className="sr-only">
              Resumo do dia
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Marcações"
                value="12"
                context="+2 vs. sexta passada"
                accent="bg-mint"
              />
              <MetricCard
                label="Ocupação"
                value="86%"
                context="6h disponíveis"
                accent="bg-powder"
              />
              <MetricCard
                label="Receita prevista"
                value="€ 516"
                context="Ticket médio €43"
                accent="bg-pink"
              />
              <MetricCard
                label="Novas clientes"
                value="04"
                context="33% do dia"
                accent="bg-yellow"
              />
            </div>
          </section>

          <section id="agenda" className="mt-14" aria-labelledby="agenda-title">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
                  Operação
                </p>
                <h2
                  id="agenda-title"
                  className="mt-2 text-3xl font-light tracking-[-0.045em]"
                >
                  Agenda de hoje
                </h2>
              </div>
              <label className="flex h-11 min-w-64 items-center gap-2 border-b border-ink/40 text-sm focus-within:border-ink">
                <Search className="size-4 text-graphite" aria-hidden="true" />
                <span className="sr-only">Pesquisar marcações</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar cliente ou serviço"
                  className="w-full bg-transparent outline-none placeholder:text-graphite"
                />
              </label>
            </div>

            {loading ? (
              <p
                className="mt-6 border-t border-ink py-10 text-sm text-graphite"
                role="status"
              >
                A carregar agenda…
              </p>
            ) : null}
            {loadError ? (
              <p
                className="mt-6 border border-rose-800/25 bg-rose-50 p-4 text-sm text-rose-900"
                role="alert"
              >
                {loadError}
              </p>
            ) : null}
            <div className="mt-6 overflow-x-auto border-t border-ink">
              <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                <thead className="text-[0.65rem] uppercase tracking-[0.07em] text-graphite">
                  <tr>
                    <th className="py-4 pr-5 font-medium">Hora</th>
                    <th className="px-5 py-4 font-medium">Cliente</th>
                    <th className="px-5 py-4 font-medium">Serviço</th>
                    <th className="px-5 py-4 font-medium">Artista</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="py-4 pl-5 text-right font-medium">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t hairline transition-colors hover:bg-black/[0.035]"
                    >
                      <td className="py-5 pr-5 font-medium tabular-nums">
                        {booking.time}
                      </td>
                      <td className="px-5 py-5">
                        <span className="block">{booking.customer}</span>
                        <span className="mt-1 block text-xs text-graphite">
                          {booking.id}
                        </span>
                      </td>
                      <td className="px-5 py-5">{booking.service}</td>
                      <td className="px-5 py-5">{booking.artist}</td>
                      <td className="px-5 py-5">
                        <StatusPill
                          tone={
                            booking.status === "Confirmada"
                              ? "success"
                              : "neutral"
                          }
                        >
                          {booking.status}
                        </StatusPill>
                      </td>
                      <td className="py-5 pl-5 text-right">
                        <button
                          type="button"
                          className="inline-flex size-9 items-center justify-center rounded-full border border-ink/20"
                          aria-label={`Abrir marcação de ${booking.customer}`}
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBookings.length === 0 ? (
                <p className="border-t hairline py-12 text-center text-sm text-graphite">
                  Nenhuma marcação corresponde à pesquisa.
                </p>
              ) : null}
            </div>
          </section>

          <section
            className="mt-14 grid gap-4 md:grid-cols-2"
            aria-label="Planeamento"
          >
            <div className="border border-ink/20 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.07em] text-graphite">
                  Próximos 7 dias
                </p>
                <CalendarDays className="size-4" />
              </div>
              <p className="mt-7 text-5xl font-light tracking-[-0.055em]">68</p>
              <p className="mt-2 text-sm text-graphite">
                marcações confirmadas
              </p>
              <div
                className="mt-8 flex h-20 items-end gap-2"
                aria-hidden="true"
              >
                {[55, 78, 62, 88, 70, 96, 45].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 bg-navy"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[0.6rem] uppercase text-graphite">
                <span>{format(today, "dd MMM", { locale: pt })}</span>
                <span>
                  {format(addDays(today, 6), "dd MMM", { locale: pt })}
                </span>
              </div>
            </div>
            <div className="flex flex-col border border-ink/20 bg-navy p-6 text-bone">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.07em] text-bone/60">
                  Clientes ativas
                </p>
                <UsersRound className="size-4" />
              </div>
              <p className="mt-7 text-5xl font-light tracking-[-0.055em]">
                428
              </p>
              <p className="mt-2 text-sm text-bone/60">
                com consentimento e conta ativa
              </p>
              <p className="mt-auto pt-10 text-xs leading-5 text-bone/55">
                Os dados de contacto são visíveis apenas a perfis autorizados e
                todas as consultas administrativas são auditadas.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  context,
  accent,
}: {
  label: string;
  value: string;
  context: string;
  accent: string;
}) {
  return (
    <article className={`${accent} flex min-h-48 flex-col p-5`}>
      <p className="text-[0.65rem] uppercase tracking-[0.07em] opacity-65">
        {label}
      </p>
      <p className="mt-auto text-5xl font-light tracking-[-0.06em]">{value}</p>
      <p className="mt-2 text-xs opacity-60">{context}</p>
    </article>
  );
}
