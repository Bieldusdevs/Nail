package pt.lume.atelier.domain.repository;

import java.util.Optional;
import pt.lume.atelier.domain.model.PasswordResetToken;
import pt.lume.atelier.domain.model.UserAccount;

public interface PasswordResetTokenRepository {
    void invalidateActiveTokens(UserAccount userAccount);

    PasswordResetToken save(PasswordResetToken token);

    Optional<PasswordResetToken> findByHashForUpdate(String tokenHash);
}
