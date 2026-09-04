package pt.lume.atelier.application.dto.auth;

import jakarta.validation.constraints.Pattern;

public record MfaVerifyRequest(@Pattern(regexp = "^\\d{6}$") String code) {}
