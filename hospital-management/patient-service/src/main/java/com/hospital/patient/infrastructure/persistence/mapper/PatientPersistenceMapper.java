package com.hospital.patient.infrastructure.persistence.mapper;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.infrastructure.persistence.entity.PatientEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PatientPersistenceMapper {
    PatientEntity toEntity(Patient patient);
    Patient toDomain(PatientEntity entity);
}
