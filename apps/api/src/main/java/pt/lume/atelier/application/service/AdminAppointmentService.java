package pt.lume.atelier.application.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.dto.admin.AdminAppointmentResponse;
import pt.lume.atelier.application.dto.shared.PageResponse;
import pt.lume.atelier.domain.model.AppointmentStatus;
import pt.lume.atelier.domain.repository.AppointmentRepository;

@Service
public class AdminAppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AdminAppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<AdminAppointmentResponse> search(
            AppointmentStatus status,
            UUID professionalId,
            Instant from,
            Instant to,
            int page,
            int size,
            boolean ascending) {
        String statusName = status == null ? null : status.name();
        List<AdminAppointmentResponse> content =
                appointmentRepository
                        .findForAdministration(
                                statusName, professionalId, from, to, page, size, ascending)
                        .stream()
                        .map(AdminAppointmentResponse::from)
                        .toList();
        long total =
                appointmentRepository.countForAdministration(statusName, professionalId, from, to);
        return PageResponse.of(content, page, size, total);
    }
}
