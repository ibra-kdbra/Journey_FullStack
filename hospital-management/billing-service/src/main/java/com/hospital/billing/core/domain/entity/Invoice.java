package com.hospital.billing.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    private String id;
    private String patientId;
    private String appointmentId;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal netAmount;
    private InvoiceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}

enum InvoiceStatus {
    PENDING, PAID, CANCELLED, REFUNDED
}
