package pt.lume.atelier.application.dto.booking;

import java.time.Instant;
import java.util.UUID;
import pt.lume.atelier.domain.model.Appointment;

public record AppointmentResponse(
        UUID id,
        String reference,
        String status,
        Instant startsAt,
        Instant endsAt,
        ServiceSummary service,
        ProfessionalSummary professional) {

    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                createReference(appointment.getId()),
                appointment.getStatus().name(),
                appointment.getStartsAt(),
                appointment.getEndsAt(),
                new ServiceSummary(
                        appointment.getService().getId(),
                        appointment.getService().getName(),
                        appointment.getService().getPriceCents()),
                new ProfessionalSummary(
                        appointment.getProfessional().getId(),
                        appointment.getProfessional().getName()));
    }

    private static String createReference(UUID id) {
        return "LM-" + id.toString().substring(0, 6).toUpperCase();
    }

    public record ServiceSummary(UUID id, String name, int priceCents) {}

    public record ProfessionalSummary(UUID id, String name) {}
}
