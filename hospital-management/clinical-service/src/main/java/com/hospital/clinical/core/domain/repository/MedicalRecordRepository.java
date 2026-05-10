package com.hospital.clinical.core.domain.repository;

import com.hospital.clinical.core.domain.entity.MedicalRecord;
import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository {
    MedicalRecord save(MedicalRecord record);
    Optional<MedicalRecord> findById(String id);
    List<MedicalRecord> findAll();
    List<MedicalRecord> findAllByPatientId(String patientId);
    void deleteById(String id);
}
