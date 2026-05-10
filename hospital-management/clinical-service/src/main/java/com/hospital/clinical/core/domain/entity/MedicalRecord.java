package com.hospital.clinical.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    private String id;
    private String patientId;
    private String doctorId;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private LocalDateTime recordDate;
    private String notes;
}
