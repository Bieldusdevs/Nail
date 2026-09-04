package pt.lume.atelier.domain.repository;

import java.util.Optional;
import java.util.UUID;
import pt.lume.atelier.domain.model.UserAccount;

public interface UserAccountRepository {
    boolean existsByEmail(String email);

    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findById(UUID id);

    UserAccount save(UserAccount userAccount);
}
