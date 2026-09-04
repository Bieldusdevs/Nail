"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { addDays, format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  CalendarDays,
  Clock3,
  LogOut,
  MapPin,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { nailServices } from "@/config/site";
import { logout } from "@/services/auth-service";
import { ApiError } from "@/services/api-client";
import {
  cancelAccountAppointment,
  getAccountOverview,
} from "@/services/account-service";

interface DisplayAppointment {
  id: string;
  reference: string;
  startsAt: string;
  serviceName: string;
  status: "CONFIRMED" | "CANCELLED";
}

function getDefaultAppointment(): DisplayAppointment {
  const futureDate = addDays(new Date(), 6);
  futureDate.setHours(15, 30, 0, 0);
  return {
    id: "demo-appointment",
    reference: "LM-DEMO26",
    startsAt: futureDate.toISOString(),
    serviceName: "Manicure Signature",
    status: "CONFIRMED",
  };
}

export function AccountDashboard() {
  const router = useRouter();
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [firstName, setFirstName] = useState(demoMode ? "Marta" : "");
  const [appointment, setAppointment] = useState<DisplayAppointment | null>(
    demoMode ? getDefaultAppointment : null,
  );
  const [accountLoading, setAccountLoading] = useState(!demoMode);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (demoMode) {
      const hydrationTask = window.setTimeout(() => {
        const storedUser = sessionStorage.getItem("lume-demo-user");
        const storedAppointment = sessionStorage.getItem(
          "lume-demo-appointment",
        );
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as { firstName?: string };
          if (parsedUser.firstName) setFirstName(parsedUser.firstName);
        }
        if (storedAppointment) {
          const parsedAppointment = JSON.parse(storedAppointment) as {
            id: string;
            reference: string;
            startsAt: string;
            serviceId?: string;
          };
          const serviceName = nailServices.find(
            (service) => service.id === parsedAppointment.serviceId,
          )?.name;
          setAppointment({
            id: parsedAppointment.id,
            reference: parsedAppointment.reference,
            startsAt: parsedAppointment.startsAt,
            serviceName: serviceName ?? "Manicure Signature",
            status: "CONFIRMED",
          });
        }
      }, 0);
      return () => window.clearTimeout(hydrationTask);
    }

    void getAccountOverview()
      .then((overview) => {
        setFirstName(overview.user.firstName);
        const nextAppointment = overview.appointments.find(
          (item) => item.status === "CONFIRMED",
        );
        setAppointment(
          nextAppointment
            ? {
                id: nextAppointment.id,
                reference: nextAppointment.reference,
                startsAt: nextAppointment.startsAt,
                serviceName: nextAppointment.service.name,
                status: "CONFIRMED",
              }
            : null,
        );
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401)
          router.replace("/entrar");
      })
      .finally(() => setAccountLoading(false));
  }, [demoMode, router]);

  async function cancelAppointment() {
    if (!appointment) return;
    setCancelling(true);
    try {
      if (demoMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 600));
      } else {
        await cancelAccountAppointment(appointment.id);
      }
      setAppointment((current) =>
        current ? { ...current, status: "CANCELLED" } : null,
      );
      setCancelDialogOpen(false);
      setAnnouncement("A marcação foi cancelada com sucesso.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  const startsAt = appointment ? parseISO(appointment.startsAt) : null;

  return (
    <div className="page-gutter pb-24 pt-10 md:pt-16">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="flex flex-col gap-8 border-b border-ink pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.08em] text-graphite">
            A minha conta
          </p>
          <h1 className="mt-4 text-[clamp(3rem,7vw,7rem)] font-light leading-[0.9] tracking-[-0.06em]">
            Olá, {firstName}.
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex w-fit items-center gap-2 text-sm text-graphite transition-colors hover:text-ink"
        >
          <LogOut className="size-4" strokeWidth={1.5} /> Terminar sessão
        </button>
      </div>

      <div className="grid gap-14 py-12 lg:grid-cols-[14rem_1fr] lg:gap-20">
        <nav aria-label="Área pessoal">
          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="#proximas"
                className="flex items-center justify-between border-b border-ink py-3 font-medium"
              >
                Próximas <span>01</span>
              </a>
            </li>
            <li>
              <a
                href="#historico"
                className="flex items-center justify-between border-b hairline py-3 text-graphite"
              >
                Histórico <span>03</span>
              </a>
            </li>
            <li>
              <a
                href="#perfil"
                className="flex items-center justify-between border-b hairline py-3 text-graphite"
              >
                Perfil
              </a>
            </li>
            <li>
              <a
                href="#seguranca"
                className="flex items-center justify-between border-b hairline py-3 text-graphite"
              >
                Segurança
              </a>
            </li>
          </ul>
        </nav>

        <section id="proximas" aria-labelledby="upcoming-title">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2
              id="upcoming-title"
              className="text-2xl font-light tracking-[-0.035em]"
            >
              Próxima marcação
            </h2>
            {appointment ? (
              <StatusPill
                tone={
                  appointment.status === "CONFIRMED" ? "success" : "neutral"
                }
              >
                {appointment.status === "CONFIRMED"
                  ? "Confirmada"
                  : "Cancelada"}
              </StatusPill>
            ) : null}
          </div>

          {accountLoading ? (
            <div className="h-64 skeleton-shimmer" role="status">
              <span className="sr-only">A carregar marcações</span>
            </div>
          ) : null}
          {!accountLoading && appointment && startsAt ? (
            <article className="border border-ink/20">
              <div className="grid md:grid-cols-[12rem_1fr_auto]">
                <div className="flex min-h-44 flex-col justify-between bg-powder p-5">
                  <p className="text-[0.65rem] uppercase tracking-[0.08em]">
                    {format(startsAt, "MMMM", { locale: pt })}
                  </p>
                  <p className="text-7xl font-light leading-none tracking-[-0.07em]">
                    {format(startsAt, "dd")}
                  </p>
                  <p className="text-xs capitalize">
                    {format(startsAt, "EEEE", { locale: pt })}
                  </p>
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.08em] text-graphite">
                    {appointment.reference}
                  </p>
                  <h3 className="mt-3 text-3xl font-light tracking-[-0.045em]">
                    {appointment.serviceName}
                  </h3>
                  <dl className="mt-7 grid gap-4 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 size-4" strokeWidth={1.4} />
                      <div>
                        <dt className="text-xs text-graphite">Hora</dt>
                        <dd className="mt-1">{format(startsAt, "HH:mm")}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4" strokeWidth={1.4} />
                      <div>
                        <dt className="text-xs text-graphite">Local</dt>
                        <dd className="mt-1">Lume Atelier, Almada</dd>
                      </div>
                    </div>
                  </dl>
                </div>
                <div className="flex items-start justify-end border-t hairline p-4 md:border-l md:border-t-0">
                  <button
                    type="button"
                    className="flex size-10 items-center justify-center rounded-full border border-ink/25"
                    aria-label="Mais opções"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>
              {appointment.status === "CONFIRMED" ? (
                <div className="flex flex-wrap gap-3 border-t hairline p-4 md:justify-end">
                  <Button variant="outline" size="compact">
                    Alterar horário
                  </Button>
                  <Button
                    variant="ghost"
                    size="compact"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : null}
            </article>
          ) : null}
          {!accountLoading && !appointment ? (
            <div className="border border-ink/20 p-8 text-center md:p-14">
              <p className="text-3xl font-light tracking-[-0.045em]">
                Ainda não tens uma marcação.
              </p>
              <Button asChild className="mt-6">
                <a href="/reservar">Encontrar um horário</a>
              </Button>
            </div>
          ) : null}

          <div className="mt-8 flex items-start gap-3 border-l-2 border-yellow pl-4 text-sm leading-6 text-graphite">
            <CalendarDays className="mt-1 size-4 shrink-0" strokeWidth={1.5} />
            <p>
              Podes alterar ou cancelar gratuitamente até 24 horas antes do
              início da sessão.
            </p>
          </div>
        </section>
      </div>

      <Dialog.Root open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-bone p-6 sm:p-10">
            <Dialog.Close
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-ink/20"
              aria-label="Fechar"
            >
              <X className="size-4" />
            </Dialog.Close>
            <Dialog.Title className="pr-10 text-4xl font-light tracking-[-0.05em]">
              Cancelar esta marcação?
            </Dialog.Title>
            <Dialog.Description className="mt-5 text-sm leading-6 text-graphite">
              O horário ficará novamente disponível. Esta ação não pode ser
              anulada, mas podes fazer uma nova marcação quando quiseres.
            </Dialog.Description>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button variant="outline">Manter marcação</Button>
              </Dialog.Close>
              <Button onClick={cancelAppointment} loading={cancelling}>
                Sim, cancelar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
