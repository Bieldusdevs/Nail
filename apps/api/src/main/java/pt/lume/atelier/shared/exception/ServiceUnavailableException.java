package pt.lume.atelier.shared.exception;

public class ServiceUnavailableException extends ApplicationException {
    public ServiceUnavailableException(String publicMessage) {
        super("SERVICE_TEMPORARILY_UNAVAILABLE", publicMessage);
    }
}
