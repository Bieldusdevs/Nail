package pt.lume.atelier.infrastructure.persistence;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.lume.atelier.domain.model.Appointment;

interface SpringDataAppointmentRepository extends JpaRepository<Appointment, UUID> {

    interface IntervalProjection {
        Instant getStartsAt();

        Instant getEndsAt();
    }

    Optional<Appointment> findByIdempotencyKey(String idempotencyKey);

    @Query(
            """
            select (count(appointment) > 0) from Appointment appointment
            where appointment.professional.id = :professionalId
              and appointment.status in (pt.lume.atelier.domain.model.AppointmentStatus.PENDING, pt.lume.atelier.domain.model.AppointmentStatus.CONFIRMED)
              and appointment.startsAt < :endsAt
              and appointment.endsAt > :startsAt
            """)
    boolean existsOverlapping(
            @Param("professionalId") UUID professionalId,
            @Param("startsAt") Instant startsAt,
            @Param("endsAt") Instant endsAt);

    @Query(
            """
            select appointment.startsAt as startsAt, appointment.endsAt as endsAt
            from Appointment appointment
            where appointment.professional.id = :professionalId
              and appointment.status in (pt.lume.atelier.domain.model.AppointmentStatus.PENDING, pt.lume.atelier.domain.model.AppointmentStatus.CONFIRMED)
              and appointment.startsAt < :to
              and appointment.endsAt > :from
            order by appointment.startsAt
            """)
    List<IntervalProjection> findBookedIntervals(
            @Param("professionalId") UUID professionalId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @EntityGraph(attributePaths = {"service", "professional"})
    Optional<Appointment> findByIdAndUserId(UUID appointmentId, UUID userId);

    @EntityGraph(attributePaths = {"service", "professional"})
    Page<Appointment> findAllByUserIdOrderByStartsAtDesc(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"service", "professional"})
    @Query(
            """
            select appointment from Appointment appointment
            where (:status is null or appointment.status = :status)
              and (:professionalId is null or appointment.professional.id = :professionalId)
              and (:from is null or appointment.startsAt >= :from)
              and (:to is null or appointment.startsAt < :to)
            """)
    Page<Appointment> findForAdministration(
            @Param("status") pt.lume.atelier.domain.model.AppointmentStatus status,
            @Param("professionalId") UUID professionalId,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable);
}
