package pt.lume.atelier.domain.model;

public enum UserRole {
    USER,
    ADMIN,
    SUPER_ADMIN;

    public boolean requiresMfa() {
        return this == ADMIN || this == SUPER_ADMIN;
    }
}
