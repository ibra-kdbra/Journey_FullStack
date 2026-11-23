package com.hospital.patient.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEntity {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phoneNumber;
    
    private LocalDate dateOfBirth;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private boolean archived;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "providerName", column = @Column(name = "insurance_provider_name")),
            @AttributeOverride(name = "policyNumber", column = @Column(name = "insurance_policy_number")),
            @AttributeOverride(name = "groupNumber", column = @Column(name = "insurance_group_number")),
            @AttributeOverride(name = "active", column = @Column(name = "insurance_active"))
    })
    private InsuranceDetailsEmbeddable insuranceDetails;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "name", column = @Column(name = "emergency_contact_name")),
            @AttributeOverride(name = "relationship", column = @Column(name = "emergency_contact_relationship")),
            @AttributeOverride(name = "phoneNumber", column = @Column(name = "emergency_contact_phone_number")),
            @AttributeOverride(name = "email", column = @Column(name = "emergency_contact_email"))
    })
    private EmergencyContactEmbeddable emergencyContact;
}
