package com.hospital.patient.infrastructure.web.controller;

import com.hospital.patient.core.domain.exception.DuplicateEmailException;
import com.hospital.patient.core.domain.exception.PatientNotFoundException;
import com.hospital.patient.core.usecase.PatientUseCase;
import org.springframework.dao.DataIntegrityViolationException;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

    @Test
    void unknownPatientReturnsNotFound() throws Exception {
        when(patientUseCase.getPatientById("missing")).thenThrow(new PatientNotFoundException("missing"));

        mockMvc.perform(get("/api/v1/patients/missing").with(httpBasic("test-user", "test-password-only")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void duplicateEmailReturnsConflict() throws Exception {
        when(patientUseCase.registerPatient(any())).thenThrow(new DuplicateEmailException("john.doe@example.com"));

        mockMvc.perform(post("/api/v1/patients")
                .with(httpBasic("test-user", "test-password-only"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestJson()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void uniqueConstraintViolationReturnsConflict() throws Exception {
        when(patientUseCase.registerPatient(any())).thenThrow(new DataIntegrityViolationException("uk_patients_email"));

        mockMvc.perform(post("/api/v1/patients")
                .with(httpBasic("test-user", "test-password-only"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(validRequestJson()))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidBodyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/patients")
                .with(httpBasic("test-user", "test-password-only"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    private String validRequestJson() throws Exception {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));
        return objectMapper.writeValueAsString(request);
    }
}
