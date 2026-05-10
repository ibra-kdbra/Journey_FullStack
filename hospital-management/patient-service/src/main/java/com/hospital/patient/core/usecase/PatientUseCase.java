package com.hospital.patient.core.usecase;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.core.domain.entity.InsuranceDetails;
import com.hospital.patient.core.domain.entity.EmergencyContact;
import com.hospital.patient.core.domain.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class PatientUseCase {

    private final PatientRepository patientRepository;

    // Use Case 1: Register a new patient
    public Patient registerPatient(Patient patient) {
        if (patientRepository.findByEmail(patient.getEmail()).isPresent()) {
            throw new RuntimeException("Patient already exists");
        }
        patient.setId(UUID.randomUUID().toString());
        patient.setCreatedAt(LocalDateTime.now());
        patient.setUpdatedAt(LocalDateTime.now());
        patient.setArchived(false);
        return patientRepository.save(patient);
    }

    // Use Case 2: Get patient by ID
    public Patient getPatientById(String id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    // Use Case 3: List all active patients
    public List<Patient> getAllActivePatients() {
        return patientRepository.findAll().stream()
                .filter(p -> !p.isArchived())
                .collect(Collectors.toList());
    }

    // Use Case 4: Update basic profile info
    public Patient updateProfile(String id, String name, String phone) {
        var patient = getPatientById(id);
        patient.setFirstName(name);
        patient.setPhoneNumber(phone);
        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    // Use Case 5: Archive patient (Soft Delete)
    public void archivePatient(String id) {
        var patient = getPatientById(id);
        patient.setArchived(true);
        patient.setUpdatedAt(LocalDateTime.now());
        patientRepository.save(patient);
    }

    // Use Case 6: Restore archived patient
    public void restorePatient(String id) {
        var patient = getPatientById(id);
        patient.setArchived(false);
        patient.setUpdatedAt(LocalDateTime.now());
        patientRepository.save(patient);
    }

    // Use Case 7: Update insurance information
    public Patient updateInsurance(String id, InsuranceDetails insurance) {
        var patient = getPatientById(id);
        patient.setInsuranceDetails(insurance);
        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    // Use Case 8: Update emergency contact
    public Patient updateEmergencyContact(String id, EmergencyContact contact) {
        var patient = getPatientById(id);
        patient.setEmergencyContact(contact);
        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    // Use Case 9: Search patients by name
    public List<Patient> searchByName(String query) {
        return patientRepository.findAll().stream()
                .filter(p -> p.getFirstName().toLowerCase().contains(query.toLowerCase()) || 
                             p.getLastName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
    }

    // Use Case 10: Validate insurance status
    public boolean isInsuranceValid(String id) {
        var patient = getPatientById(id);
        return patient.getInsuranceDetails() != null && patient.getInsuranceDetails().isActive();
    }

    // Use Case 11: Change patient email
    public Patient changeEmail(String id, String newEmail) {
        if (patientRepository.findByEmail(newEmail).isPresent()) {
            throw new RuntimeException("Email already taken");
        }
        var patient = getPatientById(id);
        patient.setEmail(newEmail);
        patient.setUpdatedAt(LocalDateTime.now());
        return patientRepository.save(patient);
    }

    // Use Case 12: Get archived patients
    public List<Patient> getArchivedPatients() {
        return patientRepository.findAll().stream()
                .filter(Patient::isArchived)
                .collect(Collectors.toList());
    }

    // Use Case 13: Bulk Archive (Administrative)
    public void bulkArchive(List<String> ids) {
        ids.forEach(this::archivePatient);
    }

    // Use Case 14: Check Patient age eligibility
    public boolean isAdult(String id) {
        var patient = getPatientById(id);
        return patient.getDateOfBirth().plusYears(18).isBefore(LocalDateTime.now().toLocalDate());
    }

    // Use Case 15: Generate Patient Summary
    public String getPatientSummary(String id) {
        var p = getPatientById(id);
        return String.format("Patient: %s %s, Email: %s, Status: %s", 
            p.getFirstName(), p.getLastName(), p.getEmail(), p.isArchived() ? "Archived" : "Active");
    }
}
