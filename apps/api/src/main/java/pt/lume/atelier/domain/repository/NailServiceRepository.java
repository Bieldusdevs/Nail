package pt.lume.atelier.domain.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import pt.lume.atelier.domain.model.NailService;

public interface NailServiceRepository {
    List<NailService> findAllActive();

    Optional<NailService> findActiveById(UUID id);
}
