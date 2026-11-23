CREATE TABLE IF NOT EXISTS patients (
    id                              VARCHAR(255) PRIMARY KEY,
    first_name                      VARCHAR(255) NOT NULL,
    last_name                       VARCHAR(255) NOT NULL,
    email                           VARCHAR(255) NOT NULL UNIQUE,
    phone_number                    VARCHAR(255),
    date_of_birth                   DATE,
    created_at                      TIMESTAMP(6) NOT NULL,
    updated_at                      TIMESTAMP(6),
    archived                        BOOLEAN NOT NULL DEFAULT FALSE,
    insurance_provider_name         VARCHAR(255),
    insurance_policy_number         VARCHAR(255),
    insurance_group_number          VARCHAR(255),
    insurance_active                BOOLEAN,
    emergency_contact_name          VARCHAR(255),
    emergency_contact_relationship  VARCHAR(255),
    emergency_contact_phone_number  VARCHAR(255),
    emergency_contact_email         VARCHAR(255)
);

-- Databases created before Flyway (by ddl-auto=update) may predate this column.
ALTER TABLE patients ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;
