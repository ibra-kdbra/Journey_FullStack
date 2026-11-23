package com.hospital.patient.infrastructure.web.controller;

import com.hospital.patient.core.usecase.PatientUseCase;
import com.hospital.patient.infrastructure.web.dto.PatientRequestDTO;
import com.hospital.patient.infrastructure.web.mapper.PatientWebMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.patient.infrastructure.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
@Import(SecurityConfig.class)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PatientUseCase patientUseCase;

    @MockitoBean
    private PatientWebMapper mapper;

    @Test
    void registerPatient_ShouldReturnCreated() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));

        mockMvc.perform(post("/api/v1/patients")
                .with(httpBasic("test-user", "test-password-only"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void anonymousCannotListPatients() throws Exception {
        mockMvc.perform(get("/api/v1/patients")).andExpect(status().isUnauthorized());
        verifyNoInteractions(patientUseCase);
    }

    @Test
    void anonymousCannotReadPatientById() throws Exception {
        mockMvc.perform(get("/api/v1/patients/abc")).andExpect(status().isUnauthorized());
        verifyNoInteractions(patientUseCase);
    }

    @Test
    void anonymousCannotRegisterPatient() throws Exception {
        mockMvc.perform(post("/api/v1/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(patientUseCase);
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/patients").with(httpBasic("test-user", "nope")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserCanListPatients() throws Exception {
        mockMvc.perform(get("/api/v1/patients").with(httpBasic("test-user", "test-password-only")))
                .andExpect(status().isOk());
    }

    @Test
    void anonymousCannotReachActuatorEnvOrHeapdump() throws Exception {
        mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/heapdump")).andExpect(status().isUnauthorized());
    }
}
