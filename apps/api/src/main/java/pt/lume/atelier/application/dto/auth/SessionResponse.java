package pt.lume.atelier.application.dto.auth;

import java.time.Instant;

public record SessionResponse(
        String handle,
        boolean current,
        Instant createdAt,
        Instant lastAccessedAt,
        Instant expiresAt) {}
