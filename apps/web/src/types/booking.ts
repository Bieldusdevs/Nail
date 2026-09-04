export type ServiceAccent = "mint" | "pink" | "blue" | "navy";

export interface NailService {
  id: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  accent: ServiceAccent;
}

export interface NailProfessional {
  id: string;
  name: string;
  specialty: string;
  initials: string;
}

export interface BookingSelection {
  serviceId: string;
  professionalId: string;
  date: string;
  startTime: string;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  privacyAccepted: boolean;
}

export interface CreateAppointmentRequest
  extends BookingSelection, CustomerDetails {}

export interface AppointmentConfirmation {
  id: string;
  reference: string;
  status: "CONFIRMED";
  startsAt: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  error: string;
  message: string;
  requestId?: string;
  fieldErrors?: ApiFieldError[];
}
