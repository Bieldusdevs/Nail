package pt.lume.atelier.application.service;

import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.dto.catalog.ProfessionalResponse;
import pt.lume.atelier.application.dto.catalog.ServiceResponse;
import pt.lume.atelier.domain.repository.NailProfessionalRepository;
import pt.lume.atelier.domain.repository.NailServiceRepository;

@Service
public class CatalogService {

    private final NailServiceRepository serviceRepository;
    private final NailProfessionalRepository professionalRepository;

    public CatalogService(
            NailServiceRepository serviceRepository,
            NailProfessionalRepository professionalRepository) {
        this.serviceRepository = serviceRepository;
        this.professionalRepository = professionalRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "active-services", sync = true)
    public List<ServiceResponse> listServices() {
        return serviceRepository.findAllActive().stream().map(ServiceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "active-professionals", sync = true)
    public List<ProfessionalResponse> listProfessionals() {
        return professionalRepository.findAllActive().stream()
                .map(ProfessionalResponse::from)
                .toList();
    }
}
