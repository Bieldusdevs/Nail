package pt.lume.atelier.security;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pt.lume.atelier.domain.model.UserAccount;
import pt.lume.atelier.domain.model.UserRole;
import pt.lume.atelier.domain.model.UserStatus;

public final class LumeUserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String passwordHash;
    private final UserRole role;
    private final UserStatus status;

    private LumeUserPrincipal(
            UUID id, String email, String passwordHash, UserRole role, UserStatus status) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
    }

    public static LumeUserPrincipal from(UserAccount userAccount) {
        return new LumeUserPrincipal(
                userAccount.getId(),
                userAccount.getEmail(),
                userAccount.getPasswordHash(),
                userAccount.getRole(),
                userAccount.getStatus());
    }

    public UUID id() {
        return id;
    }

    public UserRole role() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.LOCKED;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
