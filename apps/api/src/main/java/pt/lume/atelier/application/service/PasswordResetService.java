package pt.lume.atelier.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.port.PasswordResetNotifier;
import pt.lume.atelier.domain.model.PasswordResetToken;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.PasswordResetTokenRepository;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.shared.exception.InvalidRequestException;

@Service
public class PasswordResetService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final UserAccountRepository userAccountRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetNotifier notifier;
    private final PasswordEncoder passwordEncoder;
    private final SessionManagementService sessionManagementService;
    private final Clock clock;

    public PasswordResetService(
            UserAccountRepository userAccountRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordResetNotifier notifier,
            PasswordEncoder passwordEncoder,
            SessionManagementService sessionManagementService,
            Clock clock) {
        this.userAccountRepository = userAccountRepository;
        this.tokenRepository = tokenRepository;
        this.notifier = notifier;
        this.passwordEncoder = passwordEncoder;
        this.sessionManagementService = sessionManagementService;
        this.clock = clock;
    }

    @Transactional
    public void request(String email) {
        String rawToken = generateToken();
        String tokenHash = hash(rawToken);
        userAccountRepository
                .findByEmail(UserAccount.normalizeEmail(email))
                .ifPresent(
                        userAccount -> {
                            Instant now = clock.instant();
                            tokenRepository.invalidateActiveTokens(userAccount);
                            tokenRepository.save(
                                    new PasswordResetToken(
                                            userAccount,
                                            tokenHash,
                                            now.plus(Duration.ofMinutes(20)),
                                            now));
                            notifier.sendPasswordReset(
                                    userAccount.getEmail(), userAccount.getFirstName(), rawToken);
                        });
    }

    @Transactional
    public void confirm(String rawToken, String newPassword) {
        Instant now = clock.instant();
        PasswordResetToken resetToken =
                tokenRepository
                        .findByHashForUpdate(hash(rawToken))
                        .filter(token -> token.isUsableAt(now))
                        .orElseThrow(
                                () ->
                                        new InvalidRequestException(
                                                "INVALID_OR_EXPIRED_RESET_TOKEN",
                                                "A ligação de recuperação é inválida ou expirou."));
        UserAccount userAccount = resetToken.getUser();
        userAccount.changePassword(passwordEncoder.encode(newPassword));
        resetToken.consume(now);
        sessionManagementService.revokeAll(userAccount.getEmail());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String value) {
        try {
            byte[] digest =
                    MessageDigest.getInstance("SHA-256")
                            .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
