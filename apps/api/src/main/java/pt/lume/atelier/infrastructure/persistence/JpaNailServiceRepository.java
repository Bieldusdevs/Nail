package pt.lume.atelier.infrastructure.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import pt.lume.atelier.domain.model.NailService;
import pt.lume.atelier.domain.repository.NailServiceRepository;

@Repository
public class JpaNailServiceRepository implements NailServiceRepository {

    private final SpringDataNailServiceRepository delegate;

    public JpaNailServiceRepository(SpringDataNailServiceRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public List<NailService> findAllActive() {
        return delegate.findAllByActiveTrueOrderByPriceCentsAsc();
    }

    @Override
    public Optional<NailService> findActiveById(UUID id) {
        return delegate.findByIdAndActiveTrue(id);
    }
}
