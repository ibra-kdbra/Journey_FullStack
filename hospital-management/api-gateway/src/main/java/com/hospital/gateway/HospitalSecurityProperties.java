package com.hospital.gateway;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Credentials clients must present; validated so startup fails when they are missing. */
@Validated
@ConfigurationProperties(prefix = "hospital.security")
public record HospitalSecurityProperties(@NotBlank String username, @NotBlank String password) {
}
