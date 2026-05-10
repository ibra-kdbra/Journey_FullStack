package com.hospital.patient.core.domain.repository;

import com.hospital.patient.core.domain.entity.Patient;
import java.util.List;
import java.util.Optional;

public interface PatientRepository {
    Patient save(Patient patient);
    Optional<Patient> findById(String id);
    Optional<Patient> findByEmail(String email);
    List<Patient> findAll();
    void deleteById(String id);
}
