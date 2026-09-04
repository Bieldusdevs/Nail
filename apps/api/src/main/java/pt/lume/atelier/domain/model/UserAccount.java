package pt.lume.atelier.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserAccount extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "mfa_enabled", nullable = false)
    private boolean mfaEnabled;

    @Column(name = "mfa_secret_ciphertext", length = 512)
    private String mfaSecretCiphertext;

    @Version private long version;

    protected UserAccount() {}

    public UserAccount(
            String email, String passwordHash, String firstName, String lastName, String phone) {
        this.email = normalizeEmail(email);
        this.passwordHash = Objects.requireNonNull(passwordHash);
        this.firstName = Objects.requireNonNull(firstName).trim();
        this.lastName = Objects.requireNonNull(lastName).trim();
        this.phone = Objects.requireNonNull(phone).trim();
        this.role = UserRole.USER;
        this.status = UserStatus.ACTIVE;
    }

    public static String normalizeEmail(String email) {
        return Objects.requireNonNull(email).trim().toLowerCase(Locale.ROOT);
    }

    public void changePassword(String encodedPassword) {
        this.passwordHash = Objects.requireNonNull(encodedPassword);
    }

    public void configureAdministrativeAccess(
            UserRole administrativeRole, String encryptedMfaSecret) {
        if (!administrativeRole.requiresMfa()) {
            throw new IllegalArgumentException("Administrative role required");
        }
        this.role = administrativeRole;
        this.mfaSecretCiphertext = Objects.requireNonNull(encryptedMfaSecret);
        this.mfaEnabled = true;
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getPhone() {
        return phone;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public boolean isMfaEnabled() {
        return mfaEnabled;
    }

    public String getMfaSecretCiphertext() {
        return mfaSecretCiphertext;
    }
}
