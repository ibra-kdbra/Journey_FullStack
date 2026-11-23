package com.hospital.patient.infrastructure.persistence.mapper;

import com.hospital.patient.core.domain.entity.EmergencyContact;
import com.hospital.patient.core.domain.entity.InsuranceDetails;
import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.infrastructure.persistence.entity.EmergencyContactEmbeddable;
import com.hospital.patient.infrastructure.persistence.entity.InsuranceDetailsEmbeddable;
import com.hospital.patient.infrastructure.persistence.entity.PatientEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

// ERROR: a field added to Patient or PatientEntity without a mapping must fail the build,
// not be silently dropped on save.
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface PatientPersistenceMapper {
    PatientEntity toEntity(Patient patient);

    // Lombok's builder names the boolean "isArchived" on the domain side; the entity property is "archived".
    @Mapping(target = "isArchived", source = "archived")
    Patient toDomain(PatientEntity entity);

    InsuranceDetailsEmbeddable toEmbeddable(InsuranceDetails insurance);

    @Mapping(target = "isActive", source = "active")
    InsuranceDetails toDomain(InsuranceDetailsEmbeddable embeddable);

    EmergencyContactEmbeddable toEmbeddable(EmergencyContact contact);

    EmergencyContact toDomain(EmergencyContactEmbeddable embeddable);
}
