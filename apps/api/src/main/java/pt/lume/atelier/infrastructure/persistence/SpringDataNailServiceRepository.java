package pt.lume.atelier.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.lume.atelier.domain.model.NailService;

interface SpringDataNailServiceRepository extends JpaRepository<NailService, UUID> {
    List<NailService> findAllByActiveTrueOrderByPriceCentsAsc();

    Optional<NailService> findByIdAndActiveTrue(UUID id);
}
