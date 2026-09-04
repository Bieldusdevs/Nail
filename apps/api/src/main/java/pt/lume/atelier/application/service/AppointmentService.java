package pt.lume.atelier.application.service;

import java.text.Normalizer;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.dto.booking.AppointmentResponse;
import pt.lume.atelier.application.dto.booking.CreateAppointmentRequest;
import pt.lume.atelier.application.dto.shared.PageResponse;
import pt.lume.atelier.application.port.BookingNotifier;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.Appointment;
import pt.lume.atelier.domain.model.NailProfessional;
import pt.lume.atelier.domain.model.NailService;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.AppointmentRepository;
import pt.lume.atelier.domain.repository.NailProfessionalRepository;
import pt.lume.atelier.domain.repository.NailServiceRepository;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.security.LumeUserPrincipal;
import pt.lume.atelier.shared.exception.ConflictException;
import pt.lume.atelier.shared.exception.InvalidRequestException;
import pt.lume.atelier.shared.exception.ResourceNotFoundException;

@Service
public class AppointmentService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 30);
    private static final LocalTime WEEKDAY_CLOSING_TIME = LocalTime.of(19, 0);
    private static final LocalTime SATURDAY_CLOSING_TIME = LocalTime.of(18, 0);

    private final NailServiceRepository serviceRepository;
    private final NailProfessionalRepository professionalRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserAccountRepository userAccountRepository;
    private final BookingNotifier bookingNotifier;
    private final AppProperties properties;
    private final Clock clock;

    public AppointmentService(
            NailServiceRepository serviceRepository,
            NailProfessionalRepository professionalRepository,
            AppointmentRepository appointmentRepository,
            UserAccountRepository userAccountRepository,
            BookingNotifier bookingNotifier,
            AppProperties properties,
            Clock clock) {
        this.serviceRepository = serviceRepository;
        this.professionalRepository = professionalRepository;
        this.appointmentRepository = appointmentRepository;
        this.userAccountRepository = userAccountRepository;
        this.bookingNotifier = bookingNotifier;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public AppointmentResponse create(
            CreateAppointmentRequest request,
            String idempotencyKey,
            LumeUserPrincipal authenticatedUser) {
        validateIdempotencyKey(idempotencyKey);
        String normalizedEmail = UserAccount.normalizeEmail(request.email());
        Appointment existingAppointment =
                appointmentRepository.findByIdempotencyKey(idempotencyKey).orElse(null);
        if (existingAppointment != null) {
            if (!existingAppointment.getCustomerEmail().equals(normalizedEmail)) {
                throw new ConflictException(
                        "IDEMPOTENCY_KEY_REUSED", "Não foi possível processar esta marcação.");
            }
            return AppointmentResponse.from(existingAppointment);
        }

        NailService service =
                serviceRepository
                        .findActiveById(request.serviceId())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "SERVICE_NOT_FOUND", "Serviço não encontrado."));
        ZonedDateTime startsAt =
                resolveStart(request.date(), request.startTime(), service.getDurationMinutes());
        ZonedDateTime endsAt = startsAt.plusMinutes(service.getDurationMinutes());
        NailProfessional professional =
                selectAndLockProfessional(
                        request.serviceId(),
                        request.professionalId(),
                        startsAt.toInstant(),
                        endsAt.toInstant());
        UserAccount user =
                authenticatedUser == null
                        ? null
                        : userAccountRepository.findById(authenticatedUser.id()).orElse(null);

        Appointment appointment =
                new Appointment(
                        user,
                        service,
                        professional,
                        startsAt.toInstant(),
                        endsAt.toInstant(),
                        normalizePlainText(request.firstName()),
                        normalizePlainText(request.lastName()),
                        normalizedEmail,
                        request.phone(),
                        normalizePlainText(request.notes()),
                        idempotencyKey);
        try {
            Appointment savedAppointment = appointmentRepository.save(appointment);
            bookingNotifier.sendConfirmation(savedAppointment);
            return AppointmentResponse.from(savedAppointment);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException(
                    "TIME_SLOT_UNAVAILABLE",
                    "Este horário deixou de estar disponível. Escolhe outro.");
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponse> listOwned(
            LumeUserPrincipal principal, int page, int size) {
        List<AppointmentResponse> appointments =
                appointmentRepository.findForUser(principal.id(), page, size).stream()
                        .map(AppointmentResponse::from)
                        .toList();
        return PageResponse.of(
                appointments, page, size, appointmentRepository.countForUser(principal.id()));
    }

    @Transactional
    public AppointmentResponse cancel(UUID appointmentId, LumeUserPrincipal principal) {
        Appointment appointment =
                appointmentRepository
                        .findOwnedById(appointmentId, principal.id())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "APPOINTMENT_NOT_FOUND",
                                                "Marcação não encontrada."));
        Instant cancellationDeadline =
                appointment
                        .getStartsAt()
                        .minus(Duration.ofHours(properties.booking().cancellationHours()));
        if (!clock.instant().isBefore(cancellationDeadline)) {
            throw new ConflictException(
                    "CANCELLATION_WINDOW_CLOSED",
                    "Esta marcação já não pode ser cancelada online.");
        }
        appointment.cancel(clock.instant());
        return AppointmentResponse.from(appointment);
    }

    private NailProfessional selectAndLockProfessional(
            UUID serviceId, String requestedProfessional, Instant startsAt, Instant endsAt) {
        List<NailProfessional> eligibleProfessionals =
                professionalRepository.findActiveForService(serviceId);
        if (requestedProfessional != null && !requestedProfessional.equals("any")) {
            UUID requestedId;
            try {
                requestedId = UUID.fromString(requestedProfessional);
            } catch (IllegalArgumentException exception) {
                throw new InvalidRequestException(
                        "INVALID_PROFESSIONAL", "A artista indicada não é válida.");
            }
            eligibleProfessionals =
                    eligibleProfessionals.stream()
                            .filter(professional -> professional.getId().equals(requestedId))
                            .toList();
        }
        for (NailProfessional professional : eligibleProfessionals) {
            NailProfessional lockedProfessional =
                    professionalRepository
                            .findActiveByIdForUpdate(professional.getId())
                            .orElse(null);
            if (lockedProfessional != null
                    && !appointmentRepository.existsOverlapping(
                            lockedProfessional.getId(), startsAt, endsAt)) {
                return lockedProfessional;
            }
        }
        throw new ConflictException(
                "TIME_SLOT_UNAVAILABLE", "Este horário deixou de estar disponível. Escolhe outro.");
    }

    private ZonedDateTime resolveStart(LocalDate date, LocalTime time, int durationMinutes) {
        LocalDate today = LocalDate.now(clock.withZone(properties.booking().zoneId()));
        if (date.isBefore(today)
                || date.isAfter(today.plusDays(properties.booking().maximumDaysAhead()))) {
            throw new InvalidRequestException(
                    "INVALID_BOOKING_DATE", "A data indicada não está disponível para marcação.");
        }
        if (date.getDayOfWeek() == DayOfWeek.SUNDAY || date.getDayOfWeek() == DayOfWeek.MONDAY) {
            throw new InvalidRequestException(
                    "STUDIO_CLOSED", "O atelier está encerrado na data indicada.");
        }
        ZonedDateTime startsAt = date.atTime(time).atZone(properties.booking().zoneId());
        LocalTime closingTime =
                date.getDayOfWeek() == DayOfWeek.SATURDAY
                        ? SATURDAY_CLOSING_TIME
                        : WEEKDAY_CLOSING_TIME;
        if (time.isBefore(OPENING_TIME) || time.plusMinutes(durationMinutes).isAfter(closingTime)) {
            throw new InvalidRequestException(
                    "OUTSIDE_BUSINESS_HOURS", "O horário indicado não está disponível.");
        }
        if (!startsAt.toInstant().isAfter(clock.instant())) {
            throw new InvalidRequestException("BOOKING_IN_PAST", "O horário indicado já passou.");
        }
        return startsAt;
    }

    private String normalizePlainText(String value) {
        if (value == null) return null;
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFKC).trim();
        if (normalized
                .chars()
                .anyMatch(
                        character ->
                                Character.isISOControl(character)
                                        && character != '\n'
                                        && character != '\r'
                                        && character != '\t')) {
            throw new InvalidRequestException(
                    "INVALID_TEXT_CONTENT", "O texto contém caracteres não permitidos.");
        }
        return normalized;
    }

    private void validateIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || !idempotencyKey.matches("^[A-Za-z0-9_-]{8,80}$")) {
            throw new InvalidRequestException(
                    "INVALID_IDEMPOTENCY_KEY", "O identificador do pedido não é válido.");
        }
    }
}
