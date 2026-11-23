package com.hospital.patient.infrastructure.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Credentials of the API user. Bound with validation so the service fails at
 * startup when they are missing, instead of running open or with a default.
 */
@Validated
@ConfigurationProperties(prefix = "hospital.security")
public record HospitalSecurityProperties(@NotBlank String username, @NotBlank String password) {
}
