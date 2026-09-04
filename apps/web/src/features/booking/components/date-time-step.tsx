"use client";

import { addDays, format, getDay, startOfToday } from "date-fns";
import { pt } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { StepHeading } from "@/features/booking/components/step-heading";
import { getAvailableSlots } from "@/services/booking-service";

interface DateTimeStepProps {
  date: string;
  time: string;
  serviceId: string;
  professionalId: string;
  durationMinutes: number;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

interface AvailabilityState {
  requestKey: string;
  slots: string[];
  error: string;
}

export function DateTimeStep({
  date,
  time,
  serviceId,
  professionalId,
  durationMinutes,
  onDateChange,
  onTimeChange,
}: DateTimeStepProps) {
  const [availability, setAvailability] = useState<AvailabilityState>({
    requestKey: "",
    slots: [],
    error: "",
  });
  const dates = useMemo(() => {
    const availableDates: Date[] = [];
    let cursor = startOfToday();
    while (availableDates.length < 14) {
      if (getDay(cursor) !== 0 && getDay(cursor) !== 1)
        availableDates.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return availableDates;
  }, []);
  const requestKey = date
    ? `${date}:${serviceId}:${professionalId}:${durationMinutes}`
    : "";
  const loading = Boolean(requestKey && availability.requestKey !== requestKey);
  const slots =
    availability.requestKey === requestKey ? availability.slots : [];
  const loadError =
    availability.requestKey === requestKey ? availability.error : "";

  useEffect(() => {
    if (!date) return;
    let active = true;
    const activeRequestKey = `${date}:${serviceId}:${professionalId}:${durationMinutes}`;

    void getAvailableSlots(date, serviceId, professionalId, durationMinutes)
      .then((availableSlots) => {
        if (active) {
          setAvailability({
            requestKey: activeRequestKey,
            slots: availableSlots,
            error: "",
          });
        }
      })
      .catch(() => {
        if (active) {
          setAvailability({
            requestKey: activeRequestKey,
            slots: [],
            error: "Não foi possível consultar os horários. Tenta novamente.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [date, serviceId, professionalId, durationMinutes]);

  return (
    <div>
      <StepHeading
        eyebrow="Passo 3 de 4"
        title="Quando tens tempo para ti?"
        description="Mostramos apenas horários com duração suficiente para o serviço escolhido. A marcação fica confirmada no passo seguinte."
      />

      <fieldset>
        <legend className="mb-4 text-xs font-medium uppercase tracking-[0.07em]">
          Escolhe o dia
        </legend>
        <div className="no-scrollbar grid grid-cols-4 gap-2 pb-3 sm:flex sm:snap-x sm:overflow-x-auto">
          {dates.map((availableDate) => {
            const dateValue = format(availableDate, "yyyy-MM-dd");
            const checked = date === dateValue;
            return (
              <label
                key={dateValue}
                className="cursor-pointer sm:shrink-0 sm:snap-start"
              >
                <input
                  type="radio"
                  name="date"
                  value={dateValue}
                  checked={checked}
                  onChange={() => onDateChange(dateValue)}
                  className="peer sr-only"
                />
                <span className="flex h-24 w-full flex-col items-center justify-center border border-ink/20 transition-colors hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-magenta peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone sm:w-[4.65rem]">
                  <span className="text-[0.62rem] uppercase tracking-[0.06em] opacity-65">
                    {format(availableDate, "EEE", { locale: pt }).replace(
                      ".",
                      "",
                    )}
                  </span>
                  <span className="mt-1 text-2xl font-light">
                    {format(availableDate, "d")}
                  </span>
                  <span className="mt-1 text-[0.62rem] uppercase tracking-[0.05em] opacity-65">
                    {format(availableDate, "MMM", { locale: pt }).replace(
                      ".",
                      "",
                    )}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-9" disabled={!date || loading}>
        <legend className="mb-4 flex min-h-5 items-center gap-3 text-xs font-medium uppercase tracking-[0.07em]">
          Escolhe a hora
          {loading ? <Spinner label="A consultar horários" /> : null}
        </legend>
        {!date ? (
          <p className="border-y hairline py-6 text-sm text-graphite">
            Seleciona primeiro um dia para veres os horários.
          </p>
        ) : null}
        {loadError ? (
          <p
            role="alert"
            className="border border-rose-800/30 bg-rose-50 p-4 text-sm text-rose-900"
          >
            {loadError}
          </p>
        ) : null}
        {!loading && date && !loadError ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {slots.map((slot) => (
              <label key={slot} className="cursor-pointer">
                <input
                  type="radio"
                  name="time"
                  value={slot}
                  checked={time === slot}
                  onChange={() => onTimeChange(slot)}
                  className="peer sr-only"
                />
                <span className="flex h-12 items-center justify-center rounded-pill border border-ink/25 text-sm tabular-nums transition-colors hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-magenta peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone">
                  {slot}
                </span>
              </label>
            ))}
            {slots.length === 0 ? (
              <p className="col-span-full py-4 text-sm text-graphite">
                Sem disponibilidade neste dia.
              </p>
            ) : null}
          </div>
        ) : null}
      </fieldset>
    </div>
  );
}
