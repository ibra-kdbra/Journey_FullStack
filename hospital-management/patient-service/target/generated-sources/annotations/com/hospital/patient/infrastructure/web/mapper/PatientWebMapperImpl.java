package com.hospital.patient.infrastructure.web.mapper;

import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.infrastructure.web.dto.PatientRequestDTO;
import com.hospital.patient.infrastructure.web.dto.PatientResponseDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-11-23T10:34:22+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Ubuntu)"
)
@Component
public class PatientWebMapperImpl implements PatientWebMapper {

    @Override
    public Patient toDomain(PatientRequestDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Patient.PatientBuilder patient = Patient.builder();

        patient.firstName( dto.getFirstName() );
        patient.lastName( dto.getLastName() );
        patient.email( dto.getEmail() );
        patient.phoneNumber( dto.getPhoneNumber() );
        patient.dateOfBirth( dto.getDateOfBirth() );

        return patient.build();
    }

    @Override
    public PatientResponseDTO toResponseDTO(Patient patient) {
        if ( patient == null ) {
            return null;
        }

        PatientResponseDTO patientResponseDTO = new PatientResponseDTO();

        patientResponseDTO.setId( patient.getId() );
        patientResponseDTO.setFirstName( patient.getFirstName() );
        patientResponseDTO.setLastName( patient.getLastName() );
        patientResponseDTO.setEmail( patient.getEmail() );
        patientResponseDTO.setPhoneNumber( patient.getPhoneNumber() );
        patientResponseDTO.setDateOfBirth( patient.getDateOfBirth() );
        patientResponseDTO.setCreatedAt( patient.getCreatedAt() );

        return patientResponseDTO;
    }
}
