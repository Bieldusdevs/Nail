package pt.lume.atelier.presentation;

import java.util.List;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.lume.atelier.application.dto.catalog.ProfessionalResponse;
import pt.lume.atelier.application.dto.catalog.ServiceResponse;
import pt.lume.atelier.application.service.CatalogService;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/services")
    ResponseEntity<List<ServiceResponse>> services() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofMinutes(5)).cachePublic())
                .body(catalogService.listServices());
    }

    @GetMapping("/professionals")
    ResponseEntity<List<ProfessionalResponse>> professionals() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(java.time.Duration.ofMinutes(5)).cachePublic())
                .body(catalogService.listProfessionals());
    }
}
