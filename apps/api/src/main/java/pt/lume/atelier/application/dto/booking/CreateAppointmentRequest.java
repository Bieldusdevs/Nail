package pt.lume.atelier.application.dto.booking;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateAppointmentRequest(
        @NotNull UUID serviceId,
        @NotBlank @Size(max = 40) String professionalId,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime startTime,
        @NotBlank @Size(min = 2, max = 60) @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,59}$")
                String firstName,
        @NotBlank @Size(min = 2, max = 60) @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,59}$")
                String lastName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Pattern(regexp = "^(?:\\+351)?(?:2\\d{8}|9[1236]\\d{7})$") String phone,
        @Size(max = 500) String notes,
        @AssertTrue boolean privacyAccepted) {}
