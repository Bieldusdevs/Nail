import { apiRequest } from "@/services/api-client";

export interface AdminAppointment {
  id: string;
  reference: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  startsAt: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  service: { name: string };
  professional: { name: string };
}

interface AdminAppointmentPage {
  content: AdminAppointment[];
  totalElements: number;
}

export async function listAdminAppointments(): Promise<AdminAppointmentPage> {
  return apiRequest<AdminAppointmentPage>(
    "/admin/appointments?size=100&direction=asc",
  );
}
