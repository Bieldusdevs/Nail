package pt.lume.atelier.infrastructure.bootstrap;

import org.apache.commons.codec.binary.Base32;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.model.UserRole;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.security.MfaSecretCipher;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrapRunner.class);
    private final AppProperties properties;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final MfaSecretCipher mfaSecretCipher;

    public AdminBootstrapRunner(
            AppProperties properties,
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder,
            MfaSecretCipher mfaSecretCipher) {
        this.properties = properties;
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.mfaSecretCipher = mfaSecretCipher;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) {
        AppProperties.BootstrapAdmin bootstrap = properties.bootstrapAdmin();
        if (!bootstrap.enabled()) return;
        validateConfiguration(bootstrap);
        String normalizedEmail = UserAccount.normalizeEmail(bootstrap.email());
        if (userAccountRepository.existsByEmail(normalizedEmail)) {
            LOGGER.info("Administrative bootstrap skipped because account already exists");
            return;
        }
        UserAccount administrator =
                new UserAccount(
                        normalizedEmail,
                        passwordEncoder.encode(bootstrap.password()),
                        "Lume",
                        "Administrator",
                        bootstrap.phone().replace(" ", ""));
        administrator.configureAdministrativeAccess(
                UserRole.SUPER_ADMIN, mfaSecretCipher.encrypt(bootstrap.totpSecret()));
        UserAccount savedAdministrator = userAccountRepository.save(administrator);
        LOGGER.info("Administrative bootstrap completed userId={}", savedAdministrator.getId());
    }

    private void validateConfiguration(AppProperties.BootstrapAdmin bootstrap) {
        if (bootstrap.email() == null
                || bootstrap.email().isBlank()
                || bootstrap.password() == null
                || !bootstrap.password().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{12,128}$")
                || bootstrap.totpSecret() == null
                || new Base32().decode(bootstrap.totpSecret()).length < 16
                || bootstrap.phone() == null
                || !bootstrap
                        .phone()
                        .replace(" ", "")
                        .matches("^(?:\\+351)?(?:2\\d{8}|9[1236]\\d{7})$")) {
            throw new IllegalStateException(
                    "Administrative bootstrap configuration is incomplete or invalid");
        }
    }
}
