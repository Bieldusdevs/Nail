package pt.lume.atelier.infrastructure.persistence;

import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import pt.lume.atelier.domain.model.PasswordResetToken;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.PasswordResetTokenRepository;

@Repository
public class JpaPasswordResetTokenRepository implements PasswordResetTokenRepository {

    private final SpringDataPasswordResetTokenRepository delegate;

    public JpaPasswordResetTokenRepository(SpringDataPasswordResetTokenRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public void invalidateActiveTokens(UserAccount userAccount) {
        delegate.invalidateActiveTokens(userAccount.getId(), Instant.now());
    }

    @Override
    public PasswordResetToken save(PasswordResetToken token) {
        return delegate.save(token);
    }

    @Override
    public Optional<PasswordResetToken> findByHashForUpdate(String tokenHash) {
        return delegate.findByHashForUpdate(tokenHash);
    }
}
