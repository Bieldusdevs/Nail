package pt.lume.atelier.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.UUID;

@Entity
@Table(name = "professionals")
public class NailProfessional extends AuditableEntity {

    @Id private UUID id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String specialty;

    @Column(nullable = false)
    private boolean active;

    @Version private long version;

    protected NailProfessional() {}

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public boolean isActive() {
        return active;
    }
}
