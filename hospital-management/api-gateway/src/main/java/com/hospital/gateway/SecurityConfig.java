package com.hospital.gateway;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import org.springframework.http.HttpStatus;

/**
 * Every request through the gateway must carry valid HTTP Basic credentials.
 * The gateway is stateless and does not use cookies, so CSRF is disabled.
 */
@Configuration
@EnableWebFluxSecurity
@EnableConfigurationProperties(HospitalSecurityProperties.class)
public class SecurityConfig {

    public static final String ROLE = "STAFF";

    @Bean
    SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(Customizer.withDefaults())
                .exceptionHandling(e -> e.authenticationEntryPoint(
                        new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeExchange(ex -> ex.anyExchange().hasRole(ROLE))
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    MapReactiveUserDetailsService userDetailsService(HospitalSecurityProperties props, PasswordEncoder encoder) {
        return new MapReactiveUserDetailsService(User.withUsername(props.username())
                .password(encoder.encode(props.password()))
                .roles(ROLE)
                .build());
    }
}
