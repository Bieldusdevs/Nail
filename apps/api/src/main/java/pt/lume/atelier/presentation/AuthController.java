package pt.lume.atelier.presentation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pt.lume.atelier.application.dto.auth.AuthResponse;
import pt.lume.atelier.application.dto.auth.LoginRequest;
import pt.lume.atelier.application.dto.auth.MfaVerifyRequest;
import pt.lume.atelier.application.dto.auth.PasswordResetConfirmRequest;
import pt.lume.atelier.application.dto.auth.PasswordResetRequest;
import pt.lume.atelier.application.dto.auth.RegisterRequest;
import pt.lume.atelier.application.dto.auth.SessionResponse;
import pt.lume.atelier.application.service.AuthService;
import pt.lume.atelier.application.service.PasswordResetService;
import pt.lume.atelier.application.service.SessionManagementService;
import pt.lume.atelier.domain.repository.UserAccountRepository;
import pt.lume.atelier.security.LumeUserPrincipal;
import pt.lume.atelier.shared.exception.AuthenticationFailedException;

@RestController
@RequestMapping("/api/v1/auth")
@Validated
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final SessionManagementService sessionManagementService;
    private final UserAccountRepository userAccountRepository;

    public AuthController(
            AuthService authService,
            PasswordResetService passwordResetService,
            SessionManagementService sessionManagementService,
            UserAccountRepository userAccountRepository) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
        this.sessionManagementService = sessionManagementService;
        this.userAccountRepository = userAccountRepository;
    }

    @GetMapping("/csrf")
    Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @PostMapping("/register")
    ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.created(URI.create("/api/v1/auth/session"))
                .body(Map.of("status", "CREATED"));
    }

    @PostMapping("/login")
    AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        return authService.login(request, servletRequest, servletResponse);
    }

    @PostMapping("/mfa/verify")
    AuthResponse verifyMfa(
            @Valid @RequestBody MfaVerifyRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        return authService.verifyMfa(request.code(), servletRequest, servletResponse);
    }

    @PostMapping("/logout")
    ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/session")
    AuthResponse currentSession(@AuthenticationPrincipal LumeUserPrincipal principal) {
        if (principal == null) throw new AuthenticationFailedException();
        return userAccountRepository
                .findById(principal.id())
                .map(AuthResponse::authenticated)
                .orElseThrow(AuthenticationFailedException::new);
    }

    @PostMapping("/password-reset/request")
    ResponseEntity<Void> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.request(request.email());
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PostMapping("/password-reset/confirm")
    ResponseEntity<Void> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.confirm(request.token(), request.password());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions")
    List<SessionResponse> sessions(
            @AuthenticationPrincipal LumeUserPrincipal principal, HttpServletRequest request) {
        HttpSession currentSession = request.getSession(false);
        return sessionManagementService.list(
                principal.getUsername(), currentSession == null ? "" : currentSession.getId());
    }

    @DeleteMapping("/sessions/{handle}")
    ResponseEntity<Void> revokeSession(
            @PathVariable @Pattern(regexp = "^[a-f0-9]{64}$") String handle,
            @AuthenticationPrincipal LumeUserPrincipal principal,
            HttpServletRequest request) {
        HttpSession currentSession = request.getSession(false);
        sessionManagementService.revoke(
                principal.getUsername(),
                handle,
                currentSession == null ? "" : currentSession.getId());
        return ResponseEntity.noContent().build();
    }
}
