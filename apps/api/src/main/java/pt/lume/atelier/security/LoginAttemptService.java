package pt.lume.atelier.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.shared.exception.AuthenticationFailedException;
import pt.lume.atelier.shared.exception.ServiceUnavailableException;

@Service
public class LoginAttemptService {

    private static final int MAXIMUM_FAILURES = 8;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private final StringRedisTemplate redisTemplate;

    public LoginAttemptService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void assertAllowed(String email) {
        try {
            String failures = redisTemplate.opsForValue().get(key(email));
            if (failures != null && Integer.parseInt(failures) >= MAXIMUM_FAILURES) {
                throw new AuthenticationFailedException();
            }
        } catch (DataAccessException exception) {
            throw new ServiceUnavailableException(
                    "Não foi possível validar o início de sessão. Tenta novamente.");
        }
    }

    public void recordFailure(String email) {
        try {
            Long failures = redisTemplate.opsForValue().increment(key(email));
            if (failures != null && failures == 1) {
                redisTemplate.expire(key(email), LOCK_DURATION);
            }
        } catch (DataAccessException exception) {
            throw new ServiceUnavailableException(
                    "Não foi possível validar o início de sessão. Tenta novamente.");
        }
    }

    public void clear(String email) {
        try {
            redisTemplate.delete(key(email));
        } catch (DataAccessException exception) {
            throw new ServiceUnavailableException(
                    "Não foi possível concluir o início de sessão. Tenta novamente.");
        }
    }

    private String key(String email) {
        String normalizedEmail = UserAccount.normalizeEmail(email);
        try {
            byte[] digest =
                    MessageDigest.getInstance("SHA-256")
                            .digest(normalizedEmail.getBytes(StandardCharsets.UTF_8));
            return "lume:login-failures:" + HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
