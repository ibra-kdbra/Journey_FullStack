package com.hospital.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
class GatewaySecurityTest {

    @Autowired
    private WebTestClient client;

    @Test
    void anonymousPatientListIsUnauthorized() {
        client.get().uri("/api/v1/patients").exchange().expectStatus().isUnauthorized();
    }

    @Test
    void wrongPasswordIsUnauthorized() {
        client.get().uri("/api/v1/patients")
                .headers(h -> h.setBasicAuth("test-user", "wrong"))
                .exchange().expectStatus().isUnauthorized();
    }

    @Test
    void anonymousActuatorIsUnauthorized() {
        client.get().uri("/actuator/env").exchange().expectStatus().isUnauthorized();
    }

    @Test
    void discoveryLocatorRouteIsNotExposedEvenWhenAuthenticated() {
        client.get().uri("/patient-service/api/v1/patients")
                .headers(h -> h.setBasicAuth("test-user", "test-password-only"))
                .exchange().expectStatus().isNotFound();
    }
}
