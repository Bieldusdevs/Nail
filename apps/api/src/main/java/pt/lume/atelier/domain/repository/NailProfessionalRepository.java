package pt.lume.atelier.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import pt.lume.atelier.domain.model.NailProfessional;

public interface NailProfessionalRepository {
    List<NailProfessional> findAllActive();

    List<NailProfessional> findActiveForService(UUID serviceId);

    Optional<NailProfessional> findActiveByIdForUpdate(UUID id);
}
