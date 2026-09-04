package pt.lume.atelier.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.UserAccountRepository;

@Repository
public class JpaUserAccountRepository implements UserAccountRepository {

    private final SpringDataUserAccountRepository delegate;

    public JpaUserAccountRepository(SpringDataUserAccountRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public boolean existsByEmail(String email) {
        return delegate.existsByEmail(email);
    }

    @Override
    public Optional<UserAccount> findByEmail(String email) {
        return delegate.findByEmail(email);
    }

    @Override
    public Optional<UserAccount> findById(UUID id) {
        return delegate.findById(id);
    }

    @Override
    public UserAccount save(UserAccount userAccount) {
        return delegate.save(userAccount);
    }
}
