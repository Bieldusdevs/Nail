package pt.lume.atelier.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import pt.lume.atelier.domain.model.NailProfessional;
import pt.lume.atelier.domain.repository.NailProfessionalRepository;

@Repository
public class JpaNailProfessionalRepository implements NailProfessionalRepository {

    private final SpringDataNailProfessionalRepository delegate;

    public JpaNailProfessionalRepository(SpringDataNailProfessionalRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public List<NailProfessional> findAllActive() {
        return delegate.findAllByActiveTrueOrderByNameAsc();
    }

    @Override
    public List<NailProfessional> findActiveForService(UUID serviceId) {
        return delegate.findActiveForService(serviceId);
    }

    @Override
    public Optional<NailProfessional> findActiveByIdForUpdate(UUID id) {
        return delegate.findActiveByIdForUpdate(id);
    }
}
