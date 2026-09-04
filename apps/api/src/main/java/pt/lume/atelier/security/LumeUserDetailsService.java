package pt.lume.atelier.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.repository.UserAccountRepository;

@Service
public class LumeUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    public LumeUserDetailsService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userAccountRepository
                .findByEmail(UserAccount.normalizeEmail(email))
                .map(LumeUserPrincipal::from)
                .orElseThrow(() -> new UsernameNotFoundException("Authentication failed"));
    }
}
