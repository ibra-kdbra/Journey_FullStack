package com.hospital.patient.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private InsuranceDetails insuranceDetails;
    private EmergencyContact emergencyContact;
    private boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
