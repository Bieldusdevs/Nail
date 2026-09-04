package pt.lume.atelier.shared.exception;

public class InvalidRequestException extends ApplicationException {
    public InvalidRequestException(String errorCode, String publicMessage) {
        super(errorCode, publicMessage);
    }
}
