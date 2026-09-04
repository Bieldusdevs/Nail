CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret_ciphertext VARCHAR(512),
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED')),
    CONSTRAINT ck_admin_mfa CHECK (role = 'USER' OR (mfa_enabled = TRUE AND mfa_secret_ciphertext IS NOT NULL))
);

CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE nail_services (
    id UUID PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(600) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_service_duration CHECK (duration_minutes BETWEEN 15 AND 300),
    CONSTRAINT ck_service_price CHECK (price_cents BETWEEN 0 AND 100000)
);

CREATE INDEX idx_nail_services_active ON nail_services (active) WHERE active = TRUE;

CREATE TABLE professionals (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    specialty VARCHAR(160) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_professionals_active ON professionals (active) WHERE active = TRUE;

CREATE TABLE professional_services (
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES nail_services(id) ON DELETE CASCADE,
    PRIMARY KEY (professional_id, service_id)
);

CREATE INDEX idx_professional_services_service ON professional_services (service_id, professional_id);

CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES nail_services(id) ON DELETE RESTRICT,
    professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL,
    customer_first_name VARCHAR(60) NOT NULL,
    customer_last_name VARCHAR(60) NOT NULL,
    customer_email VARCHAR(254) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    notes VARCHAR(500),
    idempotency_key VARCHAR(80) NOT NULL UNIQUE,
    cancelled_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_appointment_period CHECK (ends_at > starts_at),
    CONSTRAINT ck_appointment_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'))
);

ALTER TABLE appointments
    ADD CONSTRAINT ex_appointments_professional_overlap
    EXCLUDE USING GIST (
        professional_id WITH =,
        tstzrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status IN ('PENDING', 'CONFIRMED'));

CREATE INDEX idx_appointments_user_start ON appointments (user_id, starts_at DESC);
CREATE INDEX idx_appointments_professional_start ON appointments (professional_id, starts_at);
CREATE INDEX idx_appointments_status_start ON appointments (status, starts_at);
CREATE INDEX idx_appointments_customer_email_lower ON appointments (LOWER(customer_email));

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_password_reset_user_active ON password_reset_tokens (user_id, expires_at) WHERE consumed_at IS NULL;

CREATE TABLE security_audit_events (
    id UUID PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(80),
    target_id UUID,
    request_id VARCHAR(64),
    occurred_at TIMESTAMPTZ NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_security_audit_actor_time ON security_audit_events (actor_user_id, occurred_at DESC);
CREATE INDEX idx_security_audit_action_time ON security_audit_events (action, occurred_at DESC);
