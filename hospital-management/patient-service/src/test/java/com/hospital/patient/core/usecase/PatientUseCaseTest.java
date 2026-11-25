package com.hospital.patient.core.usecase;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.core.domain.exception.DuplicateEmailException;
import com.hospital.patient.core.domain.exception.PatientNotFoundException;
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
        assertThrows(DuplicateEmailException.class, () -> patientUseCase.registerPatient(patient));
        verify(patientRepository, never()).save(any());
    }

    @Test
    void getPatientById_ShouldThrowNotFound_WhenMissing() {
        when(patientRepository.findById("nope")).thenReturn(Optional.empty());
        assertThrows(PatientNotFoundException.class, () -> patientUseCase.getPatientById("nope"));
    }

    @Test
    void changeEmail_ShouldThrowDuplicate_WhenTaken() {
        when(patientRepository.findByEmail("taken@example.com"))
                .thenReturn(Optional.of(Patient.builder().build()));
        assertThrows(DuplicateEmailException.class, () -> patientUseCase.changeEmail("id", "taken@example.com"));
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

    @Test
    void updateProfile_ShouldUpdateFirstAndLastNameIndependently() {
        // Given
        String id = "test-id";
        Patient patient = Patient.builder().id(id).firstName("Jane").lastName("Roe").build();
        when(patientRepository.findById(id)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        Patient updated = patientUseCase.updateProfile(id, "Janet", "Roe", "555-0100");

        // Then: first name changed, last name untouched
        assertEquals("Janet", updated.getFirstName());
        assertEquals("Roe", updated.getLastName());
        assertEquals("555-0100", updated.getPhoneNumber());

        // When: only the last name changes
        updated = patientUseCase.updateProfile(id, "Janet", "Smith", "555-0100");

        // Then
        assertEquals("Janet", updated.getFirstName());
        assertEquals("Smith", updated.getLastName());
    }
}
