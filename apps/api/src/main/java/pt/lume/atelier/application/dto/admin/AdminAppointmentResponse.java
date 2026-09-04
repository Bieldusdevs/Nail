package pt.lume.atelier.application.dto.admin;

import java.time.Instant;
import java.util.UUID;
import pt.lume.atelier.domain.model.Appointment;

public record AdminAppointmentResponse(
        UUID id,
        String reference,
        String status,
        Instant startsAt,
        Instant endsAt,
        Customer customer,
        Service service,
        Professional professional,
        String notes) {

    public static AdminAppointmentResponse from(Appointment appointment) {
        return new AdminAppointmentResponse(
                appointment.getId(),
                "LM-" + appointment.getId().toString().substring(0, 6).toUpperCase(),
                appointment.getStatus().name(),
                appointment.getStartsAt(),
                appointment.getEndsAt(),
                new Customer(
                        appointment.getCustomerFirstName(),
                        appointment.getCustomerLastName(),
                        appointment.getCustomerEmail(),
                        appointment.getCustomerPhone()),
                new Service(appointment.getService().getId(), appointment.getService().getName()),
                new Professional(
                        appointment.getProfessional().getId(),
                        appointment.getProfessional().getName()),
                appointment.getNotes());
    }

    public record Customer(String firstName, String lastName, String email, String phone) {}

    public record Service(UUID id, String name) {}

    public record Professional(UUID id, String name) {}
}
