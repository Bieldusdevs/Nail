package pt.lume.atelier.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import pt.lume.atelier.application.dto.booking.CreateAppointmentRequest;
import pt.lume.atelier.application.port.BookingNotifier;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.Appointment;
import pt.lume.atelier.domain.model.NailProfessional;
import pt.lume.atelier.domain.model.NailService;
import pt.lume.atelier.domain.repository.AppointmentRepository;
import pt.lume.atelier.domain.repository.NailProfessionalRepository;
import pt.lume.atelier.domain.repository.NailServiceRepository;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.shared.exception.ConflictException;

class AppointmentServiceTest {

    private static final UUID SERVICE_ID = UUID.fromString("b6712d0d-2104-4ab0-a851-878667a0ee01");
    private static final UUID PROFESSIONAL_ID =
            UUID.fromString("a7712d0d-2104-4ab0-a851-878667a0aa01");
    private final NailServiceRepository serviceRepository = mock(NailServiceRepository.class);
    private final NailProfessionalRepository professionalRepository =
            mock(NailProfessionalRepository.class);
    private final AppointmentRepository appointmentRepository = mock(AppointmentRepository.class);
    private final UserAccountRepository userAccountRepository = mock(UserAccountRepository.class);
    private final BookingNotifier bookingNotifier = mock(BookingNotifier.class);
    private final NailService nailService = mock(NailService.class);
    private final NailProfessional professional = mock(NailProfessional.class);
    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-09-04T10:00:00Z"), ZoneOffset.UTC);
        AppProperties properties =
                new AppProperties(
                        URI.create("https://lumeatelier.pt"),
                        new AppProperties.Cors(List.of("https://lumeatelier.pt")),
                        new AppProperties.Security(
                                "", new AppProperties.Security.Login(5, 1800, 2_592_000)),
                        new AppProperties.Booking(ZoneId.of("Europe/Lisbon"), 90, 24),
                        new AppProperties.Mail(
                                "no-reply@lumeatelier.pt",
                                URI.create("https://lumeatelier.pt/redefinir")),
                        new AppProperties.BootstrapAdmin(false, "", "", "", ""));
        appointmentService =
                new AppointmentService(
                        serviceRepository,
                        professionalRepository,
                        appointmentRepository,
                        userAccountRepository,
                        bookingNotifier,
                        properties,
                        clock);
        when(nailService.getDurationMinutes()).thenReturn(60);
        when(nailService.getId()).thenReturn(SERVICE_ID);
        when(nailService.getName()).thenReturn("Manicure Signature");
        when(nailService.getPriceCents()).thenReturn(3200);
        when(professional.getId()).thenReturn(PROFESSIONAL_ID);
        when(professional.getName()).thenReturn("Inês Martins");
        when(serviceRepository.findActiveById(SERVICE_ID)).thenReturn(Optional.of(nailService));
        when(professionalRepository.findActiveForService(SERVICE_ID))
                .thenReturn(List.of(professional));
        when(professionalRepository.findActiveByIdForUpdate(PROFESSIONAL_ID))
                .thenReturn(Optional.of(professional));
    }

    @Test
    void createsGuestAppointmentWhenSlotIsAvailable() {
        when(appointmentRepository.existsOverlapping(any(), any(), any())).thenReturn(false);
        when(appointmentRepository.save(any(Appointment.class)))
                .thenAnswer(
                        invocation -> {
                            Appointment appointment = invocation.getArgument(0);
                            ReflectionTestUtils.setField(
                                    appointment,
                                    "id",
                                    UUID.fromString("6c5a4dd4-a7d0-40bd-8de8-a07d1a3b2101"));
                            return appointment;
                        });

        var response = appointmentService.create(validRequest(), "request_12345678", null);

        assertThat(response.status()).isEqualTo("CONFIRMED");
        assertThat(response.reference()).startsWith("LM-");
        verify(bookingNotifier).sendConfirmation(any(Appointment.class));
    }

    @Test
    void rejectsSlotThatBecameUnavailableInsideTransaction() {
        when(appointmentRepository.existsOverlapping(any(), any(), any())).thenReturn(true);

        assertThatThrownBy(
                        () -> appointmentService.create(validRequest(), "request_12345678", null))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("deixou de estar disponível");
        verify(appointmentRepository, never()).save(any());
    }

    private CreateAppointmentRequest validRequest() {
        return new CreateAppointmentRequest(
                SERVICE_ID,
                PROFESSIONAL_ID.toString(),
                LocalDate.of(2026, 9, 10),
                LocalTime.of(14, 0),
                "Marta",
                "Silva",
                "marta@example.pt",
                "+351912345678",
                "Sem remoção",
                true);
    }
}
