import { addMinutes, format, isBefore, parseISO } from "date-fns";
import { apiRequest } from "@/services/api-client";
import type {
  AppointmentConfirmation,
  CreateAppointmentRequest,
} from "@/types/booking";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function createDemoConfirmation(
  appointment: CreateAppointmentRequest,
): AppointmentConfirmation {
  const startsAt = `${appointment.date}T${appointment.startTime}:00+01:00`;
  const referenceSuffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  const confirmation: AppointmentConfirmation = {
    id: crypto.randomUUID(),
    reference: `LM-${referenceSuffix}`,
    status: "CONFIRMED",
    startsAt,
  };

  sessionStorage.setItem(
    "lume-demo-appointment",
    JSON.stringify({
      ...confirmation,
      serviceId: appointment.serviceId,
      professionalId: appointment.professionalId,
    }),
  );
  return confirmation;
}

export async function createAppointment(
  appointment: CreateAppointmentRequest,
): Promise<AppointmentConfirmation> {
  if (demoMode) {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    return createDemoConfirmation(appointment);
  }
  return apiRequest<AppointmentConfirmation>("/appointments", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify(appointment),
  });
}

export async function getAvailableSlots(
  date: string,
  serviceId: string,
  professionalId: string,
  serviceDurationMinutes: number,
): Promise<string[]> {
  if (!demoMode) {
    const query = new URLSearchParams({ date, serviceId, professionalId });
    const response = await apiRequest<{ slots: string[] }>(
      `/availability?${query}`,
    );
    return response.slots;
  }

  await new Promise((resolve) => window.setTimeout(resolve, 250));
  const opening = parseISO(`${date}T09:30:00`);
  const closing = parseISO(`${date}T19:00:00`);
  const unavailableIndexes = new Set([2, 5, 9]);
  const slots: string[] = [];
  let cursor = opening;
  let index = 0;

  while (addMinutes(cursor, serviceDurationMinutes) <= closing) {
    if (!unavailableIndexes.has(index) && !isBefore(cursor, new Date())) {
      slots.push(format(cursor, "HH:mm"));
    }
    cursor = addMinutes(cursor, 30);
    index += 1;
  }
  return slots;
}
