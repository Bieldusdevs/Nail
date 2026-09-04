package pt.lume.atelier.domain.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import pt.lume.atelier.domain.model.Appointment;

public interface AppointmentRepository {

    record TimeInterval(Instant startsAt, Instant endsAt) {}

    Appointment save(Appointment appointment);

    Optional<Appointment> findByIdempotencyKey(String idempotencyKey);

    boolean existsOverlapping(UUID professionalId, Instant startsAt, Instant endsAt);

    List<TimeInterval> findBookedIntervals(UUID professionalId, Instant from, Instant to);

    Optional<Appointment> findOwnedById(UUID appointmentId, UUID userId);

    List<Appointment> findForUser(UUID userId, int page, int size);

    long countForUser(UUID userId);

    List<Appointment> findForAdministration(
            String status,
            UUID professionalId,
            Instant from,
            Instant to,
            int page,
            int size,
            boolean ascending);

    long countForAdministration(String status, UUID professionalId, Instant from, Instant to);
}
