package pt.lume.atelier.application.dto.catalog;

import java.util.UUID;
import pt.lume.atelier.domain.model.NailProfessional;

public record ProfessionalResponse(UUID id, String name, String specialty) {
    public static ProfessionalResponse from(NailProfessional professional) {
        return new ProfessionalResponse(
                professional.getId(), professional.getName(), professional.getSpecialty());
    }
}
