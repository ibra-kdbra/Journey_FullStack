package com.hospital.billing.core.usecase;

import com.hospital.billing.core.domain.entity.Invoice;
import com.hospital.billing.core.domain.entity.InvoiceStatus;
import com.hospital.billing.core.domain.exception.IllegalInvoiceStateException;
import com.hospital.billing.core.domain.exception.InvalidInvoiceException;
import com.hospital.billing.core.domain.exception.InvoiceNotFoundException;
import com.hospital.billing.core.domain.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class BillingUseCase {

    private final InvoiceRepository repository;

    private Invoice load(String id) {
        return repository.findById(id).orElseThrow(() -> new InvoiceNotFoundException(id));
    }

    private static void requireStatus(Invoice invoice, InvoiceStatus expected, String operation) {
        if (invoice.getStatus() != expected) {
            throw new IllegalInvoiceStateException(invoice.getId(), invoice.getStatus(), operation);
        }
    }

    private static boolean hasStatus(Invoice invoice, InvoiceStatus status) {
        return invoice.getStatus() == status;
    }

    private static BigDecimal sumNet(java.util.stream.Stream<Invoice> invoices) {
        return invoices.map(Invoice::getNetAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Use Case 46: Create Invoice
    public Invoice createInvoice(String patientId, String appointmentId, BigDecimal amount) {
        if (patientId == null || patientId.isBlank()) {
            throw new InvalidInvoiceException("patientId is required");
        }
        if (appointmentId == null || appointmentId.isBlank()) {
            throw new InvalidInvoiceException("appointmentId is required");
        }
        if (amount == null || amount.signum() <= 0) {
            throw new InvalidInvoiceException("amount must be greater than zero");
        }
        var invoice = Invoice.builder()
                .id(UUID.randomUUID().toString())
                .patientId(patientId)
                .appointmentId(appointmentId)
                .totalAmount(amount)
                .netAmount(amount)
                .status(InvoiceStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        return repository.save(invoice);
    }

    // Use Case 47: Process Payment
    public void payInvoice(String id) {
        var invoice = load(id);
        requireStatus(invoice, InvoiceStatus.PENDING, "pay");
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        repository.save(invoice);
    }

    // Use Case 48: Apply Insurance Discount
    public void applyDiscount(String id, BigDecimal discount) {
        if (discount == null || discount.signum() < 0) {
            throw new InvalidInvoiceException("discount must not be negative");
        }
        var invoice = load(id);
        requireStatus(invoice, InvoiceStatus.PENDING, "discount");
        if (discount.compareTo(invoice.getTotalAmount()) > 0) {
            throw new InvalidInvoiceException("discount must not exceed the invoice total");
        }
        invoice.setDiscountAmount(discount);
        invoice.setNetAmount(invoice.getTotalAmount().subtract(discount));
        repository.save(invoice);
    }

    // Use Case 49: Get Invoice Details
    public Invoice getInvoice(String id) {
        return load(id);
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
                .filter(i -> hasStatus(i, InvoiceStatus.PENDING))
                .collect(Collectors.toList());
    }

    // Use Case 52: Refund Payment
    public void refund(String id) {
        var invoice = load(id);
        requireStatus(invoice, InvoiceStatus.PAID, "refund");
        invoice.setStatus(InvoiceStatus.REFUNDED);
        repository.save(invoice);
    }

    // Use Case 53: Generate Revenue Report for the current month
    public BigDecimal calculateMonthlyRevenue() {
        return calculateMonthlyRevenue(YearMonth.now());
    }

    /** Net amount of invoices that are PAID and were paid during the given month. */
    public BigDecimal calculateMonthlyRevenue(YearMonth month) {
        return sumNet(repository.findAll().stream()
                .filter(i -> hasStatus(i, InvoiceStatus.PAID))
                .filter(i -> i.getPaidAt() != null && YearMonth.from(i.getPaidAt()).equals(month)));
    }

    // Use Case 54: Cancel Invoice
    public void cancelInvoice(String id) {
        var invoice = load(id);
        requireStatus(invoice, InvoiceStatus.PENDING, "cancel");
        invoice.setStatus(InvoiceStatus.CANCELLED);
        repository.save(invoice);
    }

    // Use Case 55: Check Payment Status
    public boolean isPaid(String id) {
        return repository.findById(id).map(i -> hasStatus(i, InvoiceStatus.PAID)).orElse(false);
    }

    // Use Case 56: Get Total Due for Patient
    public BigDecimal getTotalDue(String patientId) {
        return sumNet(getPatientInvoices(patientId).stream()
                .filter(i -> hasStatus(i, InvoiceStatus.PENDING)));
    }

    // Use Case 57: List Paid Invoices
    public List<Invoice> getPaidInvoices() {
        return repository.findAll().stream()
                .filter(i -> hasStatus(i, InvoiceStatus.PAID))
                .collect(Collectors.toList());
    }

    // Use Case 58: Get Recent Payments
    public List<Invoice> getRecentPayments() {
        return repository.findAll().stream()
                .filter(i -> hasStatus(i, InvoiceStatus.PAID))
                .filter(i -> i.getPaidAt() != null && i.getPaidAt().isAfter(LocalDateTime.now().minusDays(7)))
                .collect(Collectors.toList());
    }

    // Use Case 59: Bulk Cancel Pending
    public void bulkCancelPending(String patientId) {
        getPatientInvoices(patientId).stream()
                .filter(i -> hasStatus(i, InvoiceStatus.PENDING))
                .forEach(i -> cancelInvoice(i.getId()));
    }

    // Use Case 60: Get Invoices by Appointment
    public List<Invoice> getInvoicesByAppointment(String appointmentId) {
        return repository.findAll().stream()
                .filter(i -> i.getAppointmentId().equals(appointmentId))
                .collect(Collectors.toList());
    }
}
