package com.hospital.patient.infrastructure.persistence;

import com.hospital.patient.core.domain.entity.EmergencyContact;
import com.hospital.patient.core.domain.entity.InsuranceDetails;
import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.core.usecase.PatientUseCase;
import com.hospital.patient.infrastructure.persistence.mapper.PatientPersistenceMapperImpl;
import com.hospital.patient.infrastructure.persistence.repository.JpaPatientRepository;
import com.hospital.patient.infrastructure.persistence.repository.PatientRepositoryImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Import({PatientRepositoryImpl.class, PatientPersistenceMapperImpl.class})
class PatientRepositoryImplTest {

    @Autowired
    private PatientRepositoryImpl repository;

    @Autowired
    private JpaPatientRepository jpaRepository;

    private PatientUseCase useCase() {
        return new PatientUseCase(repository);
    }

    private Patient register() {
        return useCase().registerPatient(Patient.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build());
    }

    @Test
    void archivedFlagSurvivesReload() {
        Patient saved = register();
        useCase().archivePatient(saved.getId());
        jpaRepository.flush();

        assertTrue(repository.findById(saved.getId()).orElseThrow().isArchived());
        assertTrue(useCase().getAllActivePatients().isEmpty());
        assertEquals(1, useCase().getArchivedPatients().size());

        useCase().restorePatient(saved.getId());
        assertFalse(repository.findById(saved.getId()).orElseThrow().isArchived());
    }

    @Test
    void insuranceAndEmergencyContactSurviveRoundTrip() {
        Patient saved = register();
        useCase().updateInsurance(saved.getId(), InsuranceDetails.builder()
                .providerName("Acme Health")
                .policyNumber("P-123")
                .groupNumber("G-9")
                .isActive(true)
                .build());
        useCase().updateEmergencyContact(saved.getId(), EmergencyContact.builder()
                .name("Jane Doe")
                .relationship("Spouse")
                .phoneNumber("555-0100")
                .email("jane@example.com")
                .build());
        jpaRepository.flush();

        Patient loaded = repository.findById(saved.getId()).orElseThrow();
        assertEquals("Acme Health", loaded.getInsuranceDetails().getProviderName());
        assertEquals("P-123", loaded.getInsuranceDetails().getPolicyNumber());
        assertEquals("G-9", loaded.getInsuranceDetails().getGroupNumber());
        assertTrue(loaded.getInsuranceDetails().isActive());
        assertTrue(useCase().isInsuranceValid(saved.getId()));
        assertEquals("Jane Doe", loaded.getEmergencyContact().getName());
        assertEquals("Spouse", loaded.getEmergencyContact().getRelationship());
        assertEquals("555-0100", loaded.getEmergencyContact().getPhoneNumber());
        assertEquals("jane@example.com", loaded.getEmergencyContact().getEmail());
    }

    @Test
    void updatedAtSurvivesRoundTrip() {
        Patient saved = register();
        LocalDateTime stamp = LocalDateTime.of(2026, 1, 2, 3, 4, 5);
        saved.setUpdatedAt(stamp);
        repository.save(saved);
        jpaRepository.flush();

        assertEquals(stamp, repository.findById(saved.getId()).orElseThrow().getUpdatedAt());
    }
}
