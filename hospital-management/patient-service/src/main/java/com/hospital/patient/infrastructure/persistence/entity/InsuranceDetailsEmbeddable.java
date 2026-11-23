package com.hospital.patient.infrastructure.persistence.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDetailsEmbeddable {
    private String providerName;
    private String policyNumber;
    private String groupNumber;
    private boolean active;
}
