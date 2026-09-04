package pt.lume.atelier.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import pt.lume.atelier.domain.model.Appointment;
import pt.lume.atelier.domain.repository.AppointmentRepository;

@Repository
public class JpaAppointmentRepository implements AppointmentRepository {

    private final SpringDataAppointmentRepository delegate;

    public JpaAppointmentRepository(SpringDataAppointmentRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public Appointment save(Appointment appointment) {
        return delegate.save(appointment);
    }

    @Override
    public Optional<Appointment> findByIdempotencyKey(String idempotencyKey) {
        return delegate.findByIdempotencyKey(idempotencyKey);
    }

    @Override
    public boolean existsOverlapping(UUID professionalId, Instant startsAt, Instant endsAt) {
        return delegate.existsOverlapping(professionalId, startsAt, endsAt);
    }

    @Override
    public List<TimeInterval> findBookedIntervals(UUID professionalId, Instant from, Instant to) {
        return delegate.findBookedIntervals(professionalId, from, to).stream()
                .map(interval -> new TimeInterval(interval.getStartsAt(), interval.getEndsAt()))
                .toList();
    }

    @Override
    public Optional<Appointment> findOwnedById(UUID appointmentId, UUID userId) {
        return delegate.findByIdAndUserId(appointmentId, userId);
    }

    @Override
    public List<Appointment> findForUser(UUID userId, int page, int size) {
        return delegate.findAllByUserIdOrderByStartsAtDesc(userId, PageRequest.of(page, size))
                .getContent();
    }

    @Override
    public long countForUser(UUID userId) {
        return delegate.findAllByUserIdOrderByStartsAtDesc(userId, PageRequest.of(0, 1))
                .getTotalElements();
    }

    @Override
    public List<Appointment> findForAdministration(
            String status,
            UUID professionalId,
            Instant from,
            Instant to,
            int page,
            int size,
            boolean ascending) {
        org.springframework.data.domain.Sort sort =
                org.springframework.data.domain.Sort.by("startsAt");
        sort = ascending ? sort.ascending() : sort.descending();
        pt.lume.atelier.domain.model.AppointmentStatus parsedStatus =
                status == null
                        ? null
                        : pt.lume.atelier.domain.model.AppointmentStatus.valueOf(status);
        return delegate.findForAdministration(
                        parsedStatus, professionalId, from, to, PageRequest.of(page, size, sort))
                .getContent();
    }

    @Override
    public long countForAdministration(
            String status, UUID professionalId, Instant from, Instant to) {
        pt.lume.atelier.domain.model.AppointmentStatus parsedStatus =
                status == null
                        ? null
                        : pt.lume.atelier.domain.model.AppointmentStatus.valueOf(status);
        return delegate.findForAdministration(
                        parsedStatus, professionalId, from, to, PageRequest.of(0, 1))
                .getTotalElements();
    }
}
