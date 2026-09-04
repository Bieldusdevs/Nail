package pt.lume.atelier.application.dto.auth;

import java.util.List;
import java.util.UUID;
import pt.lume.atelier.domain.model.UserAccount;

public record AuthResponse(String status, UserView user) {

    public static AuthResponse authenticated(UserAccount userAccount) {
        return new AuthResponse("AUTHENTICATED", UserView.from(userAccount));
    }

    public static AuthResponse mfaRequired() {
        return new AuthResponse("MFA_REQUIRED", null);
    }

    public record UserView(UUID id, String firstName, String email, List<String> roles) {
        public static UserView from(UserAccount userAccount) {
            return new UserView(
                    userAccount.getId(),
                    userAccount.getFirstName(),
                    userAccount.getEmail(),
                    List.of(userAccount.getRole().name()));
        }
    }
}
