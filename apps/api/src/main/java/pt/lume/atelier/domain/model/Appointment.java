package pt.lume.atelier.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class Appointment extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "service_id", nullable = false)
    private NailService service;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professional_id", nullable = false)
    private NailProfessional professional;

    @Column(name = "starts_at", nullable = false)
    private Instant startsAt;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status;

    @Column(name = "customer_first_name", nullable = false, length = 60)
    private String customerFirstName;

    @Column(name = "customer_last_name", nullable = false, length = 60)
    private String customerLastName;

    @Column(name = "customer_email", nullable = false, length = 254)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(length = 500)
    private String notes;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 80)
    private String idempotencyKey;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Version private long version;

    protected Appointment() {}

    public Appointment(
            UserAccount user,
            NailService service,
            NailProfessional professional,
            Instant startsAt,
            Instant endsAt,
            String customerFirstName,
            String customerLastName,
            String customerEmail,
            String customerPhone,
            String notes,
            String idempotencyKey) {
        this.user = user;
        this.service = Objects.requireNonNull(service);
        this.professional = Objects.requireNonNull(professional);
        this.startsAt = Objects.requireNonNull(startsAt);
        this.endsAt = Objects.requireNonNull(endsAt);
        this.customerFirstName = Objects.requireNonNull(customerFirstName).trim();
        this.customerLastName = Objects.requireNonNull(customerLastName).trim();
        this.customerEmail = UserAccount.normalizeEmail(customerEmail);
        this.customerPhone = Objects.requireNonNull(customerPhone).trim();
        this.notes = notes == null || notes.isBlank() ? null : notes.trim();
        this.idempotencyKey = Objects.requireNonNull(idempotencyKey);
        this.status = AppointmentStatus.CONFIRMED;
    }

    public void cancel(Instant cancelledAt) {
        if (status != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments can be cancelled");
        }
        status = AppointmentStatus.CANCELLED;
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
    }

    public UUID getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public NailService getService() {
        return service;
    }

    public NailProfessional getProfessional() {
        return professional;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public String getCustomerFirstName() {
        return customerFirstName;
    }

    public String getCustomerLastName() {
        return customerLastName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getNotes() {
        return notes;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }
}
