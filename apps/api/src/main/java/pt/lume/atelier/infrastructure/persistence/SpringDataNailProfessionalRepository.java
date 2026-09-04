package pt.lume.atelier.infrastructure.persistence;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pt.lume.atelier.domain.model.NailProfessional;

interface SpringDataNailProfessionalRepository extends JpaRepository<NailProfessional, UUID> {
    List<NailProfessional> findAllByActiveTrueOrderByNameAsc();

    @Query(
            value =
                    "SELECT p.* FROM professionals p JOIN professional_services ps ON ps.professional_id = p.id WHERE ps.service_id = :serviceId AND p.active = true ORDER BY p.name",
            nativeQuery = true)
    List<NailProfessional> findActiveForService(@Param("serviceId") UUID serviceId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
            "select professional from NailProfessional professional where professional.id = :id and professional.active = true")
    Optional<NailProfessional> findActiveByIdForUpdate(@Param("id") UUID id);
}
