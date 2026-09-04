import { apiRequest } from "@/services/api-client";
import type { AuthenticatedUser } from "@/services/auth-service";

export interface AccountAppointment {
  id: string;
  reference: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  startsAt: string;
  service: { name: string };
  professional: { name: string };
}

interface AppointmentPage {
  content: AccountAppointment[];
}

export async function getAccountOverview(): Promise<{
  user: AuthenticatedUser;
  appointments: AccountAppointment[];
}> {
  const [session, appointments] = await Promise.all([
    apiRequest<{ status: "AUTHENTICATED"; user: AuthenticatedUser }>(
      "/auth/session",
    ),
    apiRequest<AppointmentPage>("/appointments?size=20"),
  ]);
  return { user: session.user, appointments: appointments.content };
}

export async function cancelAccountAppointment(
  appointmentId: string,
): Promise<void> {
  await apiRequest(`/appointments/${appointmentId}`, { method: "DELETE" });
}
