package com.hospital.patient.infrastructure.web.mapper;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.infrastructure.web.dto.PatientRequestDTO;
import com.hospital.patient.infrastructure.web.dto.PatientResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PatientWebMapper {
    Patient toDomain(PatientRequestDTO dto);
    PatientResponseDTO toResponseDTO(Patient patient);
}
