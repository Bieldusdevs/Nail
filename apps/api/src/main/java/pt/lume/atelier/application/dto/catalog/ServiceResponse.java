package pt.lume.atelier.application.dto.catalog;

import java.util.UUID;
import pt.lume.atelier.domain.model.NailService;

public record ServiceResponse(
        UUID id,
        String slug,
        String name,
        String description,
        int durationMinutes,
        int priceCents) {

    public static ServiceResponse from(NailService service) {
        return new ServiceResponse(
                service.getId(),
                service.getSlug(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPriceCents());
    }
}
