package pt.lume.atelier.presentation.error;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        String error,
        String message,
        String requestId,
        Instant timestamp,
        List<FieldValidationError> fieldErrors) {}
