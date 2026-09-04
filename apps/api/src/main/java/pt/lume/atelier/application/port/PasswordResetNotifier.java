package pt.lume.atelier.application.port;

public interface PasswordResetNotifier {
    void sendPasswordReset(String email, String firstName, String rawToken);
}
