package com.hospital.billing.core.usecase;

import com.hospital.billing.core.domain.entity.Invoice;
import com.hospital.billing.core.domain.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class BillingUseCase {

    private final InvoiceRepository repository;

    // Use Case 46: Create Invoice
    public Invoice createInvoice(String patientId, String appointmentId, BigDecimal amount) {
        var invoice = Invoice.builder()
                .id(UUID.randomUUID().toString())
                .patientId(patientId)
                .appointmentId(appointmentId)
                .totalAmount(amount)
                .netAmount(amount)
                // .status(InvoiceStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(invoice);
    }

    // Use Case 47: Process Payment
    public void payInvoice(String id) {
        var invoice = repository.findById(id).orElseThrow();
        // invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        repository.save(invoice);
    }

    // Use Case 48: Apply Insurance Discount
    public void applyDiscount(String id, BigDecimal discount) {
        var invoice = repository.findById(id).orElseThrow();
        invoice.setDiscountAmount(discount);
        invoice.setNetAmount(invoice.getTotalAmount().subtract(discount));
        repository.save(invoice);
    }

    // Use Case 49: Get Invoice Details
    public Invoice getInvoice(String id) {
        return repository.findById(id).orElseThrow();
    }

    // Use Case 50: List by Patient
    public List<Invoice> getPatientInvoices(String patientId) {
        return repository.findAll().stream()
                .filter(i -> i.getPatientId().equals(patientId))
                .collect(Collectors.toList());
    }

    // Use Case 51: List Pending
    public List<Invoice> getPendingInvoices() {
        return repository.findAll().stream()
                // .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .collect(Collectors.toList());
    }

    // Use Case 52: Refund Payment
    public void refund(String id) {
        var invoice = repository.findById(id).orElseThrow();
        // invoice.setStatus(InvoiceStatus.REFUNDED);
        repository.save(invoice);
    }

    // Use Case 53: Generate Revenue Report (Mock)
    public BigDecimal calculateMonthlyRevenue() {
        return repository.findAll().stream()
                // .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                .map(Invoice::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Use Case 54: Cancel Invoice
    public void cancelInvoice(String id) {
        var invoice = repository.findById(id).orElseThrow();
        // invoice.setStatus(InvoiceStatus.CANCELLED);
        repository.save(invoice);
    }

    // Use Case 55: Check Payment Status
    public boolean isPaid(String id) {
        return repository.findById(id).map(i -> i.getPaidAt() != null).orElse(false);
    }

    // Use Case 56: Get Total Due for Patient
    public BigDecimal getTotalDue(String patientId) {
        return getPatientInvoices(patientId).stream()
                // .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .map(Invoice::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Use Case 57: List Paid Invoices
    public List<Invoice> getPaidInvoices() {
        return repository.findAll().stream()
                .filter(i -> i.getPaidAt() != null)
                .collect(Collectors.toList());
    }

    // Use Case 58: Get Recent Payments
    public List<Invoice> getRecentPayments() {
        return repository.findAll().stream()
                .filter(i -> i.getPaidAt() != null && i.getPaidAt().isAfter(LocalDateTime.now().minusDays(7)))
                .collect(Collectors.toList());
    }

    // Use Case 59: Bulk Cancel Pending
    public void bulkCancelPending(String patientId) {
        getPatientInvoices(patientId).stream()
                // .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .forEach(i -> cancelInvoice(i.getId()));
    }

    // Use Case 60: Get Invoices by Appointment
    public List<Invoice> getInvoicesByAppointment(String appointmentId) {
        return repository.findAll().stream()
                .filter(i -> i.getAppointmentId().equals(appointmentId))
                .collect(Collectors.toList());
    }
}
