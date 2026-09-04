package pt.lume.atelier.application.service;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.dto.booking.AvailabilityResponse;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.NailProfessional;
import pt.lume.atelier.domain.model.NailService;
import pt.lume.atelier.domain.repository.AppointmentRepository;
import pt.lume.atelier.domain.repository.NailProfessionalRepository;
import pt.lume.atelier.domain.repository.NailServiceRepository;
import pt.lume.atelier.shared.exception.InvalidRequestException;
import pt.lume.atelier.shared.exception.ResourceNotFoundException;

@Service
public class AvailabilityService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 30);
    private static final LocalTime WEEKDAY_CLOSING_TIME = LocalTime.of(19, 0);
    private static final LocalTime SATURDAY_CLOSING_TIME = LocalTime.of(18, 0);
    private static final Duration SLOT_INTERVAL = Duration.ofMinutes(30);

    private final NailServiceRepository serviceRepository;
    private final NailProfessionalRepository professionalRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppProperties properties;
    private final Clock clock;

    public AvailabilityService(
            NailServiceRepository serviceRepository,
            NailProfessionalRepository professionalRepository,
            AppointmentRepository appointmentRepository,
            AppProperties properties,
            Clock clock) {
        this.serviceRepository = serviceRepository;
        this.professionalRepository = professionalRepository;
        this.appointmentRepository = appointmentRepository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse findAvailability(
            UUID serviceId, String professionalId, LocalDate date) {
        NailService service =
                serviceRepository
                        .findActiveById(serviceId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "SERVICE_NOT_FOUND", "Serviço não encontrado."));
        validateDate(date);
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY || date.getDayOfWeek() == DayOfWeek.MONDAY) {
            return new AvailabilityResponse(date, List.of());
        }

        List<NailProfessional> professionals = resolveProfessionals(serviceId, professionalId);
        LocalTime closingTime =
                date.getDayOfWeek() == DayOfWeek.SATURDAY
                        ? SATURDAY_CLOSING_TIME
                        : WEEKDAY_CLOSING_TIME;
        ZonedDateTime opening = date.atTime(OPENING_TIME).atZone(properties.booking().zoneId());
        ZonedDateTime closing = date.atTime(closingTime).atZone(properties.booking().zoneId());
        Instant now = clock.instant();
        Map<UUID, List<AppointmentRepository.TimeInterval>> bookedIntervals =
                professionals.stream()
                        .collect(
                                Collectors.toMap(
                                        NailProfessional::getId,
                                        professional ->
                                                appointmentRepository.findBookedIntervals(
                                                        professional.getId(),
                                                        opening.toInstant(),
                                                        closing.toInstant())));

        java.util.ArrayList<LocalTime> availableSlots = new java.util.ArrayList<>();
        ZonedDateTime candidate = opening;
        while (!candidate.plusMinutes(service.getDurationMinutes()).isAfter(closing)) {
            Instant startsAt = candidate.toInstant();
            Instant endsAt = candidate.plusMinutes(service.getDurationMinutes()).toInstant();
            if (startsAt.isAfter(now)
                    && professionals.stream()
                            .anyMatch(
                                    professional ->
                                            hasNoOverlap(
                                                    bookedIntervals.get(professional.getId()),
                                                    startsAt,
                                                    endsAt))) {
                availableSlots.add(candidate.toLocalTime());
            }
            candidate = candidate.plus(SLOT_INTERVAL);
        }
        return new AvailabilityResponse(date, List.copyOf(availableSlots));
    }

    private List<NailProfessional> resolveProfessionals(UUID serviceId, String professionalId) {
        List<NailProfessional> eligibleProfessionals =
                professionalRepository.findActiveForService(serviceId);
        if (eligibleProfessionals.isEmpty()) {
            throw new ResourceNotFoundException(
                    "PROFESSIONAL_NOT_FOUND",
                    "Não existem artistas disponíveis para este serviço.");
        }
        if (professionalId == null || professionalId.isBlank() || professionalId.equals("any")) {
            return eligibleProfessionals;
        }
        UUID requestedId;
        try {
            requestedId = UUID.fromString(professionalId);
        } catch (IllegalArgumentException exception) {
            throw new InvalidRequestException(
                    "INVALID_PROFESSIONAL", "A artista indicada não é válida.");
        }
        return eligibleProfessionals.stream()
                .filter(professional -> professional.getId().equals(requestedId))
                .findFirst()
                .map(List::of)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "PROFESSIONAL_NOT_FOUND", "Artista não encontrada."));
    }

    private boolean hasNoOverlap(
            List<AppointmentRepository.TimeInterval> intervals, Instant startsAt, Instant endsAt) {
        return intervals.stream()
                .noneMatch(
                        interval ->
                                interval.startsAt().isBefore(endsAt)
                                        && interval.endsAt().isAfter(startsAt));
    }

    private void validateDate(LocalDate date) {
        LocalDate today = LocalDate.now(clock.withZone(properties.booking().zoneId()));
        if (date.isBefore(today)
                || date.isAfter(today.plusDays(properties.booking().maximumDaysAhead()))) {
            throw new InvalidRequestException(
                    "INVALID_BOOKING_DATE", "A data indicada não está disponível para marcação.");
        }
    }
}
