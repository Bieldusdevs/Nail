package pt.lume.atelier.shared.exception;

public class AuthenticationFailedException extends ApplicationException {
    public AuthenticationFailedException() {
        super("AUTHENTICATION_FAILED", "Email ou palavra-passe incorretos.");
    }
}
