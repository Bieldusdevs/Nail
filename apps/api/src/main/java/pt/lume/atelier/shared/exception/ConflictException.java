package pt.lume.atelier.shared.exception;

public class ConflictException extends ApplicationException {
    public ConflictException(String errorCode, String publicMessage) {
        super(errorCode, publicMessage);
    }
}
