package com.hospital.clinical.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {
    private String id;
    private String name;
    private String specialization;
    private String department;
    private boolean isAvailable;
    private List<String> qualifications;
}
