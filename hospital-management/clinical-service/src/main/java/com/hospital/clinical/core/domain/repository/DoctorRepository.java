package com.hospital.clinical.core.domain.repository;

import com.hospital.clinical.core.domain.entity.Doctor;
import java.util.List;
import java.util.Optional;

public interface DoctorRepository {
    Doctor save(Doctor doctor);
    Optional<Doctor> findById(String id);
    List<Doctor> findAll();
    void deleteById(String id);
}
