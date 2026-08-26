package com.hospital.patient.infrastructure.web.controller;

import com.hospital.patient.core.usecase.PatientUseCase;
import com.hospital.patient.infrastructure.web.dto.PatientRequestDTO;
import com.hospital.patient.infrastructure.web.mapper.PatientWebMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
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
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
