package pt.lume.atelier.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final DefaultRedisScript<Long> INCREMENT_SCRIPT =
            new DefaultRedisScript<>(
                    """
            local current = redis.call('INCR', KEYS[1])
            if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
            return current
            """,
                    Long.class);

    private final StringRedisTemplate redisTemplate;
    private final SecurityErrorWriter errorWriter;

    public RateLimitFilter(StringRedisTemplate redisTemplate, SecurityErrorWriter errorWriter) {
        this.redisTemplate = redisTemplate;
        this.errorWriter = errorWriter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        RateLimitRule rule = resolveRule(request);
        String clientFingerprint = sha256(request.getRemoteAddr());
        String key = "lume:rate:" + rule.name() + ":" + clientFingerprint;

        try {
            Long current =
                    redisTemplate.execute(
                            INCREMENT_SCRIPT, List.of(key), String.valueOf(rule.windowSeconds()));
            if (current != null && current > rule.limit()) {
                response.setHeader("Retry-After", String.valueOf(rule.windowSeconds()));
                errorWriter.write(
                        response,
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        "RATE_LIMIT_EXCEEDED",
                        "Demasiados pedidos. Tenta novamente mais tarde.");
                return;
            }
        } catch (DataAccessException exception) {
            if (rule.failClosed()) {
                LOGGER.error("Rate-limit store unavailable for sensitive endpoint");
                errorWriter.write(
                        response,
                        HttpStatus.SERVICE_UNAVAILABLE.value(),
                        "SERVICE_TEMPORARILY_UNAVAILABLE",
                        "Serviço temporariamente indisponível. Tenta novamente.");
                return;
            }
            LOGGER.warn("Rate-limit store unavailable; allowing non-sensitive request");
        }

        if (request.getRequestURI().startsWith("/api/v1/auth")) {
            response.setHeader("Cache-Control", "no-store");
        }
        filterChain.doFilter(request, response);
    }

    private RateLimitRule resolveRule(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.endsWith("/auth/login")) return new RateLimitRule("login", 5, 60, true);
        if (path.endsWith("/auth/register")) return new RateLimitRule("register", 3, 3600, true);
        if (path.contains("/auth/password-reset"))
            return new RateLimitRule("password-reset", 3, 3600, true);
        if (path.startsWith("/api/v1/admin/")) return new RateLimitRule("admin", 60, 60, true);
        if (path.equals("/api/v1/appointments") && "POST".equals(request.getMethod())) {
            return new RateLimitRule("booking", 10, 600, true);
        }
        return new RateLimitRule("api", 120, 60, false);
    }

    private String sha256(String value) {
        try {
            byte[] digest =
                    MessageDigest.getInstance("SHA-256")
                            .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }

    private record RateLimitRule(String name, int limit, int windowSeconds, boolean failClosed) {}
}
