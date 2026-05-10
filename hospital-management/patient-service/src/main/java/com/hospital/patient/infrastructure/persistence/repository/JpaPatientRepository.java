package com.hospital.patient.infrastructure.persistence.repository;

import com.hospital.patient.infrastructure.persistence.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface JpaPatientRepository extends JpaRepository<PatientEntity, String> {
    Optional<PatientEntity> findByEmail(String email);
}
