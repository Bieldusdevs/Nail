package pt.lume.atelier.presentation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.lume.atelier.application.dto.booking.AppointmentResponse;
import pt.lume.atelier.application.dto.booking.CreateAppointmentRequest;
import pt.lume.atelier.application.dto.shared.PageResponse;
import pt.lume.atelier.application.service.AppointmentService;
import pt.lume.atelier.security.LumeUserPrincipal;

@RestController
@RequestMapping("/api/v1/appointments")
@Validated
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    ResponseEntity<AppointmentResponse> create(
            @Valid @RequestBody CreateAppointmentRequest request,
            @RequestHeader("Idempotency-Key") @Pattern(regexp = "^[A-Za-z0-9_-]{8,80}$")
                    String idempotencyKey,
            @AuthenticationPrincipal LumeUserPrincipal principal) {
        AppointmentResponse appointment =
                appointmentService.create(request, idempotencyKey, principal);
        return ResponseEntity.created(URI.create("/api/v1/appointments/" + appointment.id()))
                .body(appointment);
    }

    @GetMapping
    PageResponse<AppointmentResponse> list(
            @AuthenticationPrincipal LumeUserPrincipal principal,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size) {
        return appointmentService.listOwned(principal, page, size);
    }

    @DeleteMapping("/{appointmentId}")
    AppointmentResponse cancel(
            @PathVariable UUID appointmentId,
            @AuthenticationPrincipal LumeUserPrincipal principal) {
        return appointmentService.cancel(appointmentId, principal);
    }
}
