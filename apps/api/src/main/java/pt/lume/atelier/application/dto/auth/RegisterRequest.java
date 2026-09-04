package pt.lume.atelier.application.dto.auth;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 60) @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,59}$")
                String firstName,
        @NotBlank @Size(min = 2, max = 60) @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,59}$")
                String lastName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 9, max = 20) @Pattern(regexp = "^[+0-9 ]+$") String phone,
        @NotBlank
                @Size(min = 12, max = 128)
                @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$")
                String password,
        @NotBlank String confirmPassword,
        @AssertTrue boolean privacyAccepted) {

    @AssertTrue(message = "As palavras-passe não coincidem.")
    public boolean isPasswordConfirmationValid() {
        return password != null && password.equals(confirmPassword);
    }
}
