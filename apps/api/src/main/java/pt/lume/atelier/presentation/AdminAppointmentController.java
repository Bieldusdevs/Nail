package pt.lume.atelier.presentation;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.lume.atelier.application.dto.admin.AdminAppointmentResponse;
import pt.lume.atelier.application.dto.shared.PageResponse;
import pt.lume.atelier.application.service.AdminAppointmentService;
import pt.lume.atelier.domain.model.AppointmentStatus;

@RestController
@RequestMapping("/api/v1/admin/appointments")
@Validated
public class AdminAppointmentController {

    private final AdminAppointmentService adminAppointmentService;

    public AdminAppointmentController(AdminAppointmentService adminAppointmentService) {
        this.adminAppointmentService = adminAppointmentService;
    }

    @GetMapping
    PageResponse<AdminAppointmentResponse> search(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) UUID professionalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                    Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                    Instant to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc") String direction) {
        return adminAppointmentService.search(
                status, professionalId, from, to, page, size, direction.equals("asc"));
    }
}
