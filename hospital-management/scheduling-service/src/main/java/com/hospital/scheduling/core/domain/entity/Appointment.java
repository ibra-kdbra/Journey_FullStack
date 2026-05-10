package com.hospital.scheduling.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    private String id;
    private String patientId;
    private String doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private AppointmentStatus status;
    private String reason;
    private LocalDateTime createdAt;
}

enum AppointmentStatus {
    SCHEDULED, CANCELLED, COMPLETED, NO_SHOW, RESCHEDULED
}
