package com.hospital.patient.infrastructure.persistence.mapper;

import com.hospital.patient.core.domain.entity.EmergencyContact;
import com.hospital.patient.core.domain.entity.InsuranceDetails;
import com.hospital.patient.core.domain.entity.Patient;
import com.hospital.patient.infrastructure.persistence.entity.EmergencyContactEmbeddable;
import com.hospital.patient.infrastructure.persistence.entity.InsuranceDetailsEmbeddable;
import com.hospital.patient.infrastructure.persistence.entity.PatientEntity;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-11-23T10:34:22+0000",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.12.1 (Ubuntu)"
)
@Component
public class PatientPersistenceMapperImpl implements PatientPersistenceMapper {

    @Override
    public PatientEntity toEntity(Patient patient) {
        if ( patient == null ) {
            return null;
        }

        PatientEntity.PatientEntityBuilder patientEntity = PatientEntity.builder();

        patientEntity.id( patient.getId() );
        patientEntity.firstName( patient.getFirstName() );
        patientEntity.lastName( patient.getLastName() );
        patientEntity.email( patient.getEmail() );
        patientEntity.phoneNumber( patient.getPhoneNumber() );
        patientEntity.dateOfBirth( patient.getDateOfBirth() );
        patientEntity.createdAt( patient.getCreatedAt() );
        patientEntity.updatedAt( patient.getUpdatedAt() );
        patientEntity.archived( patient.isArchived() );
        patientEntity.insuranceDetails( toEmbeddable( patient.getInsuranceDetails() ) );
        patientEntity.emergencyContact( toEmbeddable( patient.getEmergencyContact() ) );

        return patientEntity.build();
    }

    @Override
    public Patient toDomain(PatientEntity entity) {
        if ( entity == null ) {
            return null;
        }

        Patient.PatientBuilder patient = Patient.builder();

        patient.isArchived( entity.isArchived() );
        patient.id( entity.getId() );
        patient.firstName( entity.getFirstName() );
        patient.lastName( entity.getLastName() );
        patient.email( entity.getEmail() );
        patient.phoneNumber( entity.getPhoneNumber() );
        patient.dateOfBirth( entity.getDateOfBirth() );
        patient.insuranceDetails( toDomain( entity.getInsuranceDetails() ) );
        patient.emergencyContact( toDomain( entity.getEmergencyContact() ) );
        patient.createdAt( entity.getCreatedAt() );
        patient.updatedAt( entity.getUpdatedAt() );

        return patient.build();
    }

    @Override
    public InsuranceDetailsEmbeddable toEmbeddable(InsuranceDetails insurance) {
        if ( insurance == null ) {
            return null;
        }

        InsuranceDetailsEmbeddable.InsuranceDetailsEmbeddableBuilder insuranceDetailsEmbeddable = InsuranceDetailsEmbeddable.builder();

        insuranceDetailsEmbeddable.providerName( insurance.getProviderName() );
        insuranceDetailsEmbeddable.policyNumber( insurance.getPolicyNumber() );
        insuranceDetailsEmbeddable.groupNumber( insurance.getGroupNumber() );
        insuranceDetailsEmbeddable.active( insurance.isActive() );

        return insuranceDetailsEmbeddable.build();
    }

    @Override
    public InsuranceDetails toDomain(InsuranceDetailsEmbeddable embeddable) {
        if ( embeddable == null ) {
            return null;
        }

        InsuranceDetails.InsuranceDetailsBuilder insuranceDetails = InsuranceDetails.builder();

        insuranceDetails.isActive( embeddable.isActive() );
        insuranceDetails.providerName( embeddable.getProviderName() );
        insuranceDetails.policyNumber( embeddable.getPolicyNumber() );
        insuranceDetails.groupNumber( embeddable.getGroupNumber() );

        return insuranceDetails.build();
    }

    @Override
    public EmergencyContactEmbeddable toEmbeddable(EmergencyContact contact) {
        if ( contact == null ) {
            return null;
        }

        EmergencyContactEmbeddable.EmergencyContactEmbeddableBuilder emergencyContactEmbeddable = EmergencyContactEmbeddable.builder();

        emergencyContactEmbeddable.name( contact.getName() );
        emergencyContactEmbeddable.relationship( contact.getRelationship() );
        emergencyContactEmbeddable.phoneNumber( contact.getPhoneNumber() );
        emergencyContactEmbeddable.email( contact.getEmail() );

        return emergencyContactEmbeddable.build();
    }

    @Override
    public EmergencyContact toDomain(EmergencyContactEmbeddable embeddable) {
        if ( embeddable == null ) {
            return null;
        }

        EmergencyContact.EmergencyContactBuilder emergencyContact = EmergencyContact.builder();

        emergencyContact.name( embeddable.getName() );
        emergencyContact.relationship( embeddable.getRelationship() );
        emergencyContact.phoneNumber( embeddable.getPhoneNumber() );
        emergencyContact.email( embeddable.getEmail() );

        return emergencyContact.build();
    }
}
