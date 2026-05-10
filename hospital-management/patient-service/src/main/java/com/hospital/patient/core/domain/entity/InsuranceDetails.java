package com.hospital.patient.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDetails {
    private String providerName;
    private String policyNumber;
    private String groupNumber;
    private boolean isActive;
}
