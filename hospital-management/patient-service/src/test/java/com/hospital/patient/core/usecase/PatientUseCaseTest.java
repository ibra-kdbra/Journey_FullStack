package com.hospital.patient.core.usecase;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.core.domain.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientUseCaseTest {

    @Mock
    private PatientRepository patientRepository;

    private PatientUseCase patientUseCase;

    @BeforeEach
    void setUp() {
        patientUseCase = new PatientUseCase(patientRepository);
    }

    @Test
    void registerPatient_ShouldSucceed_WhenEmailIsUnique() {
        // Given
        Patient patient = Patient.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();

        when(patientRepository.findByEmail(patient.getEmail())).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Patient registered = patientUseCase.registerPatient(patient);

        // Then
        assertNotNull(registered.getId());
        assertEquals("John", registered.getFirstName());
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void registerPatient_ShouldThrowException_WhenEmailExists() {
        // Given
        Patient patient = Patient.builder().email("existing@example.com").build();
        when(patientRepository.findByEmail(patient.getEmail())).thenReturn(Optional.of(patient));

        // When & Then
        assertThrows(RuntimeException.class, () -> patientUseCase.registerPatient(patient));
        verify(patientRepository, never()).save(any());
    }

    @Test
    void getPatientById_ShouldReturnPatient_WhenExists() {
        // Given
        String id = "test-id";
        Patient patient = Patient.builder().id(id).firstName("Jane").build();
        when(patientRepository.findById(id)).thenReturn(Optional.of(patient));

        // When
        Patient found = patientUseCase.getPatientById(id);

        // Then
        assertEquals("Jane", found.getFirstName());
    }
}
