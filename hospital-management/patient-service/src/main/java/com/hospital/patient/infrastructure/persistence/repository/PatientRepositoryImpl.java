package com.hospital.patient.infrastructure.persistence.repository;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.core.domain.repository.PatientRepository;
import com.hospital.patient.infrastructure.persistence.mapper.PatientPersistenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PatientRepositoryImpl implements PatientRepository {

    private final JpaPatientRepository jpaRepository;
    private final PatientPersistenceMapper mapper;

    @Override
    public Patient save(Patient patient) {
        var entity = mapper.toEntity(patient);
        var savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Patient> findById(String id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<Patient> findByEmail(String email) {
        return jpaRepository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public List<Patient> findAll() {
        return jpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        jpaRepository.deleteById(id);
    }
}
