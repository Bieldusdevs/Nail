package pt.lume.atelier.application.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import pt.lume.atelier.application.dto.auth.SessionResponse;
import pt.lume.atelier.shared.exception.ResourceNotFoundException;

@Service
public class SessionManagementService {

    private final FindByIndexNameSessionRepository<? extends Session> sessionRepository;

    public SessionManagementService(
            FindByIndexNameSessionRepository<? extends Session> sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public List<SessionResponse> list(String principalName, String currentSessionId) {
        return sessionsFor(principalName).entrySet().stream()
                .sorted(
                        Comparator.comparing(
                                entry -> entry.getValue().getLastAccessedTime(),
                                Comparator.reverseOrder()))
                .map(entry -> toResponse(entry.getKey(), entry.getValue(), currentSessionId))
                .toList();
    }

    public void revoke(String principalName, String sessionHandle, String currentSessionId) {
        Map<String, ? extends Session> sessions = sessionsFor(principalName);
        String sessionId =
                sessions.keySet().stream()
                        .filter(candidate -> constantTimeEquals(handle(candidate), sessionHandle))
                        .findFirst()
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "SESSION_NOT_FOUND", "Sessão não encontrada."));
        if (sessionId.equals(currentSessionId)) {
            throw new ResourceNotFoundException(
                    "SESSION_NOT_FOUND", "Termina a sessão atual através do logout.");
        }
        sessionRepository.deleteById(sessionId);
    }

    public void revokeAll(String principalName) {
        sessionsFor(principalName).keySet().forEach(sessionRepository::deleteById);
    }

    public void enforceMaximum(String principalName, String currentSessionId, int maximumSessions) {
        List<String> sessionsToDelete =
                sessionsFor(principalName).entrySet().stream()
                        .filter(entry -> !entry.getKey().equals(currentSessionId))
                        .sorted(
                                Map.Entry.comparingByValue(
                                        Comparator.comparing(Session::getLastAccessedTime)))
                        .limit(
                                Math.max(
                                        0,
                                        sessionsFor(principalName).size() - maximumSessions + 1L))
                        .map(Map.Entry::getKey)
                        .toList();
        sessionsToDelete.forEach(sessionRepository::deleteById);
    }

    private Map<String, ? extends Session> sessionsFor(String principalName) {
        return sessionRepository.findByPrincipalName(principalName);
    }

    private SessionResponse toResponse(String id, Session session, String currentSessionId) {
        Instant expiresAt = session.getLastAccessedTime().plus(session.getMaxInactiveInterval());
        return new SessionResponse(
                handle(id),
                id.equals(currentSessionId),
                session.getCreationTime(),
                session.getLastAccessedTime(),
                expiresAt);
    }

    private String handle(String sessionId) {
        try {
            byte[] hash =
                    MessageDigest.getInstance("SHA-256")
                            .digest(sessionId.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }

    private boolean constantTimeEquals(String first, String second) {
        if (second == null) return false;
        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.US_ASCII),
                second.getBytes(StandardCharsets.US_ASCII));
    }
}
