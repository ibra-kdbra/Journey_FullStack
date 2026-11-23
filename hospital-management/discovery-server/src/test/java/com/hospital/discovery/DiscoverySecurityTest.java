package com.hospital.discovery;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DiscoverySecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousCannotReadRegistry() throws Exception {
        mockMvc.perform(get("/eureka/apps")).andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousCannotOpenDashboard() throws Exception {
        mockMvc.perform(get("/")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mockMvc.perform(get("/eureka/apps").with(httpBasic("test-user", "wrong")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validCredentialsReachDashboard() throws Exception {
        mockMvc.perform(get("/").with(httpBasic("test-user", "test-password-only")))
                .andExpect(status().isOk());
    }
}
