package pt.lume.atelier.application.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.lume.atelier.application.dto.auth.AuthResponse;
import pt.lume.atelier.application.dto.auth.LoginRequest;
import pt.lume.atelier.application.dto.auth.RegisterRequest;
import pt.lume.atelier.config.AppProperties;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.security.LoginAttemptService;
import pt.lume.atelier.security.LumeUserPrincipal;
import pt.lume.atelier.security.MfaSecretCipher;
import pt.lume.atelier.security.TotpVerifier;
import pt.lume.atelier.shared.exception.AuthenticationFailedException;
import pt.lume.atelier.shared.exception.ConflictException;
import pt.lume.atelier.shared.exception.InvalidRequestException;

@Service
public class AuthService {

    private static final String MFA_USER_ID = "MFA_PENDING_USER_ID";
    private static final String MFA_EXPIRES_AT = "MFA_PENDING_EXPIRES_AT";
    private static final String MFA_REMEMBER = "MFA_PENDING_REMEMBER";

    private final UserAccountRepository userAccountRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextRepository securityContextRepository;
    private final LoginAttemptService loginAttemptService;
    private final MfaSecretCipher mfaSecretCipher;
    private final TotpVerifier totpVerifier;
    private final SessionManagementService sessionManagementService;
    private final AppProperties properties;
    private final Clock clock;

    public AuthService(
            UserAccountRepository userAccountRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            SecurityContextRepository securityContextRepository,
            LoginAttemptService loginAttemptService,
            MfaSecretCipher mfaSecretCipher,
            TotpVerifier totpVerifier,
            SessionManagementService sessionManagementService,
            AppProperties properties,
            Clock clock) {
        this.userAccountRepository = userAccountRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.securityContextRepository = securityContextRepository;
        this.loginAttemptService = loginAttemptService;
        this.mfaSecretCipher = mfaSecretCipher;
        this.totpVerifier = totpVerifier;
        this.sessionManagementService = sessionManagementService;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String normalizedEmail = UserAccount.normalizeEmail(request.email());
        if (userAccountRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException(
                    "REGISTRATION_UNAVAILABLE", "Não foi possível criar a conta com estes dados.");
        }
        String normalizedPhone = request.phone().replace(" ", "");
        if (!normalizedPhone.matches("^(?:\\+351)?(?:2\\d{8}|9[1236]\\d{7})$")) {
            throw new InvalidRequestException(
                    "INVALID_PHONE", "O número de telemóvel não é válido.");
        }
        UserAccount userAccount =
                new UserAccount(
                        normalizedEmail,
                        passwordEncoder.encode(request.password()),
                        request.firstName(),
                        request.lastName(),
                        normalizedPhone);
        userAccountRepository.save(userAccount);
    }

    public AuthResponse login(
            LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        String normalizedEmail = UserAccount.normalizeEmail(request.email());
        loginAttemptService.assertAllowed(normalizedEmail);
        Authentication authentication;
        try {
            authentication =
                    authenticationManager.authenticate(
                            UsernamePasswordAuthenticationToken.unauthenticated(
                                    normalizedEmail, request.password()));
        } catch (AuthenticationException exception) {
            loginAttemptService.recordFailure(normalizedEmail);
            throw new AuthenticationFailedException();
        }
        loginAttemptService.clear(normalizedEmail);
        LumeUserPrincipal principal = (LumeUserPrincipal) authentication.getPrincipal();
        UserAccount userAccount =
                userAccountRepository
                        .findById(principal.id())
                        .orElseThrow(AuthenticationFailedException::new);

        if (principal.role().requiresMfa()) {
            if (!userAccount.isMfaEnabled() || userAccount.getMfaSecretCiphertext() == null) {
                throw new AuthenticationFailedException();
            }
            prepareMfaChallenge(servletRequest, userAccount.getId(), request.remember());
            return AuthResponse.mfaRequired();
        }

        establishSession(authentication, request.remember(), servletRequest, servletResponse);
        return AuthResponse.authenticated(userAccount);
    }

    public AuthResponse verifyMfa(
            String code, HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        HttpSession session = servletRequest.getSession(false);
        if (session == null) throw new AuthenticationFailedException();
        UUID userId = readPendingUserId(session);
        Instant expiresAt = readPendingExpiry(session);
        if (userId == null || expiresAt == null || !expiresAt.isAfter(clock.instant())) {
            clearMfaChallenge(session);
            throw new AuthenticationFailedException();
        }
        UserAccount userAccount =
                userAccountRepository
                        .findById(userId)
                        .orElseThrow(AuthenticationFailedException::new);
        String secret = mfaSecretCipher.decrypt(userAccount.getMfaSecretCiphertext());
        if (!totpVerifier.verify(secret, code)) {
            throw new AuthenticationFailedException();
        }

        LumeUserPrincipal principal = LumeUserPrincipal.from(userAccount);
        Authentication authentication =
                UsernamePasswordAuthenticationToken.authenticated(
                        principal, null, principal.getAuthorities());
        boolean remember = Boolean.TRUE.equals(session.getAttribute(MFA_REMEMBER));
        clearMfaChallenge(session);
        establishSession(authentication, remember, servletRequest, servletResponse);
        return AuthResponse.authenticated(userAccount);
    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
    }

    private void prepareMfaChallenge(HttpServletRequest request, UUID userId, boolean remember) {
        HttpSession session = request.getSession(true);
        rotateSessionId(request, session);
        session.setAttribute(MFA_USER_ID, userId.toString());
        session.setAttribute(
                MFA_EXPIRES_AT, clock.instant().plus(Duration.ofMinutes(5)).toString());
        session.setAttribute(MFA_REMEMBER, remember);
        session.setMaxInactiveInterval(300);
    }

    private void establishSession(
            Authentication authentication,
            boolean remember,
            HttpServletRequest request,
            HttpServletResponse response) {
        HttpSession session = request.getSession(true);
        rotateSessionId(request, session);
        int sessionDuration =
                remember
                        ? properties.security().login().rememberedSessionSeconds()
                        : properties.security().login().standardSessionSeconds();
        session.setMaxInactiveInterval(sessionDuration);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        sessionManagementService.enforceMaximum(
                authentication.getName(),
                session.getId(),
                properties.security().login().maximumSessions());
    }

    private void rotateSessionId(HttpServletRequest request, HttpSession session) {
        if (!session.isNew()) request.changeSessionId();
    }

    private UUID readPendingUserId(HttpSession session) {
        Object value = session.getAttribute(MFA_USER_ID);
        try {
            return value instanceof String stringValue ? UUID.fromString(stringValue) : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private Instant readPendingExpiry(HttpSession session) {
        Object value = session.getAttribute(MFA_EXPIRES_AT);
        try {
            return value instanceof String stringValue ? Instant.parse(stringValue) : null;
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private void clearMfaChallenge(HttpSession session) {
        session.removeAttribute(MFA_USER_ID);
        session.removeAttribute(MFA_EXPIRES_AT);
        session.removeAttribute(MFA_REMEMBER);
    }
}
