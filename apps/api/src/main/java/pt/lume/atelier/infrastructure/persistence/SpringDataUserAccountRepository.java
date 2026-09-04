package pt.lume.atelier.infrastructure.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import pt.lume.atelier.domain.model.UserAccount;

interface SpringDataUserAccountRepository extends JpaRepository<UserAccount, UUID> {
    boolean existsByEmail(String email);

    Optional<UserAccount> findByEmail(String email);
}
