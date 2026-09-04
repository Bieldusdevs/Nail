package pt.lume.atelier.shared.exception;

public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String errorCode, String publicMessage) {
        super(errorCode, publicMessage);
    }
}
