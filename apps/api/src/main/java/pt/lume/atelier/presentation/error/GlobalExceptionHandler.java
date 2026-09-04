package pt.lume.atelier.presentation.error;

import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pt.lume.atelier.shared.exception.ApplicationException;
import pt.lume.atelier.shared.exception.AuthenticationFailedException;
import pt.lume.atelier.shared.exception.ConflictException;
import pt.lume.atelier.shared.exception.InvalidRequestException;
import pt.lume.atelier.shared.exception.ResourceNotFoundException;
import pt.lume.atelier.shared.exception.ServiceUnavailableException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        List<FieldValidationError> fieldErrors =
                exception.getBindingResult().getAllErrors().stream()
                        .map(
                                error ->
                                        new FieldValidationError(
                                                error instanceof FieldError fieldError
                                                        ? fieldError.getField()
                                                        : "request",
                                                error.getDefaultMessage() == null
                                                        ? "Valor inválido."
                                                        : error.getDefaultMessage()))
                        .toList();
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "Os dados enviados são inválidos.",
                fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception) {
        List<FieldValidationError> fieldErrors =
                exception.getConstraintViolations().stream()
                        .map(
                                violation ->
                                        new FieldValidationError(
                                                violation.getPropertyPath().toString(),
                                                violation.getMessage()))
                        .toList();
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "Os dados enviados são inválidos.",
                fieldErrors);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MissingRequestHeaderException.class})
    ResponseEntity<ApiErrorResponse> handleMalformedRequest(Exception exception) {
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_REQUEST",
                "Os dados enviados são inválidos.",
                null);
    }

    @ExceptionHandler(ApplicationException.class)
    ResponseEntity<ApiErrorResponse> handleApplicationException(ApplicationException exception) {
        HttpStatus status =
                switch (exception) {
                    case AuthenticationFailedException ignored -> HttpStatus.UNAUTHORIZED;
                    case ResourceNotFoundException ignored -> HttpStatus.NOT_FOUND;
                    case ConflictException ignored -> HttpStatus.CONFLICT;
                    case ServiceUnavailableException ignored -> HttpStatus.SERVICE_UNAVAILABLE;
                    case InvalidRequestException ignored -> HttpStatus.BAD_REQUEST;
                    default -> HttpStatus.BAD_REQUEST;
                };
        return response(status, exception.getErrorCode(), exception.getMessage(), null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException exception) {
        LOGGER.warn("Database constraint rejected request requestId={}", MDC.get("requestId"));
        return response(
                HttpStatus.CONFLICT,
                "CONFLICT",
                "A operação entra em conflito com dados existentes.",
                null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
        LOGGER.error("Unhandled request failure requestId={}", MDC.get("requestId"), exception);
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_ERROR",
                "Ocorreu um erro inesperado. Tenta novamente.",
                null);
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status,
            String code,
            String message,
            List<FieldValidationError> fieldErrors) {
        return ResponseEntity.status(status)
                .body(
                        new ApiErrorResponse(
                                code, message, MDC.get("requestId"), Instant.now(), fieldErrors));
    }
}
