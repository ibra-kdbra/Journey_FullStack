package com.hospital.billing.core.usecase;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.hospital.billing.core.domain.entity.Invoice;
import com.hospital.billing.core.domain.entity.InvoiceStatus;
import com.hospital.billing.core.domain.exception.IllegalInvoiceStateException;
import com.hospital.billing.core.domain.exception.InvalidInvoiceException;
import com.hospital.billing.core.domain.exception.InvoiceNotFoundException;
import com.hospital.billing.core.domain.repository.InvoiceRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BillingUseCaseTest {

    private InMemoryRepository repo;
    private BillingUseCase useCase;

    @BeforeEach
    void setUp() {
        repo = new InMemoryRepository();
        useCase = new BillingUseCase(repo);
    }

    private Invoice create(String patient, String amount) {
        return useCase.createInvoice(patient, "appt-1", new BigDecimal(amount));
    }

    @Test
    void createDefaultsToPending() {
        assertEquals(InvoiceStatus.PENDING, create("p1", "100").getStatus());
    }

    @Test
    void createRejectsInvalidInput() {
        assertThrows(InvalidInvoiceException.class, () -> useCase.createInvoice("p1", "a", null));
        assertThrows(InvalidInvoiceException.class, () -> useCase.createInvoice("p1", "a", BigDecimal.ZERO));
        assertThrows(InvalidInvoiceException.class, () -> useCase.createInvoice("p1", "a", new BigDecimal("-5")));
        assertThrows(InvalidInvoiceException.class, () -> useCase.createInvoice(" ", "a", BigDecimal.TEN));
        assertThrows(InvalidInvoiceException.class, () -> useCase.createInvoice("p1", null, BigDecimal.TEN));
    }

    @Test
    void payMarksPaidAndCannotPayTwice() {
        var inv = create("p1", "100");
        useCase.payInvoice(inv.getId());
        var paid = useCase.getInvoice(inv.getId());
        assertEquals(InvoiceStatus.PAID, paid.getStatus());
        assertTrue(paid.getPaidAt() != null && useCase.isPaid(inv.getId()));
        assertThrows(IllegalInvoiceStateException.class, () -> useCase.payInvoice(inv.getId()));
    }

    @Test
    void refundOnlyPaidInvoices() {
        var inv = create("p1", "100");
        assertThrows(IllegalInvoiceStateException.class, () -> useCase.refund(inv.getId()));
        useCase.payInvoice(inv.getId());
        useCase.refund(inv.getId());
        assertEquals(InvoiceStatus.REFUNDED, useCase.getInvoice(inv.getId()).getStatus());
        assertFalse(useCase.isPaid(inv.getId()));
    }

    @Test
    void cancelOnlyPendingInvoices() {
        var inv = create("p1", "100");
        useCase.cancelInvoice(inv.getId());
        assertEquals(InvoiceStatus.CANCELLED, useCase.getInvoice(inv.getId()).getStatus());
        assertThrows(IllegalInvoiceStateException.class, () -> useCase.payInvoice(inv.getId()));
        var paid = create("p1", "50");
        useCase.payInvoice(paid.getId());
        assertThrows(IllegalInvoiceStateException.class, () -> useCase.cancelInvoice(paid.getId()));
    }

    @Test
    void unknownInvoiceThrowsNotFound() {
        assertThrows(InvoiceNotFoundException.class, () -> useCase.getInvoice("nope"));
        assertThrows(InvoiceNotFoundException.class, () -> useCase.payInvoice("nope"));
    }

    @Test
    void discountIsValidated() {
        var inv = create("p1", "100");
        assertThrows(InvalidInvoiceException.class, () -> useCase.applyDiscount(inv.getId(), null));
        assertThrows(InvalidInvoiceException.class, () -> useCase.applyDiscount(inv.getId(), new BigDecimal("-1")));
        assertThrows(InvalidInvoiceException.class, () -> useCase.applyDiscount(inv.getId(), new BigDecimal("100.01")));
        assertEquals(0, new BigDecimal("100").compareTo(useCase.getInvoice(inv.getId()).getNetAmount()));

        useCase.applyDiscount(inv.getId(), new BigDecimal("30"));
        assertEquals(0, new BigDecimal("70").compareTo(useCase.getInvoice(inv.getId()).getNetAmount()));
        useCase.payInvoice(inv.getId());
        assertThrows(IllegalInvoiceStateException.class, () -> useCase.applyDiscount(inv.getId(), BigDecimal.ONE));
    }

    @Test
    void discountEqualToTotalIsAllowed() {
        var inv = create("p1", "100");
        useCase.applyDiscount(inv.getId(), new BigDecimal("100"));
        assertEquals(0, BigDecimal.ZERO.compareTo(useCase.getInvoice(inv.getId()).getNetAmount()));
    }

    @Test
    void pendingAndTotalDueCountOnlyPending() {
        var a = create("p1", "100");
        var b = create("p1", "40");
        var c = create("p1", "10");
        var d = create("p1", "5");
        useCase.payInvoice(b.getId());
        useCase.cancelInvoice(c.getId());
        useCase.payInvoice(d.getId());
        useCase.refund(d.getId());
        create("p2", "7");

        assertEquals(2, useCase.getPendingInvoices().size());
        assertEquals(0, new BigDecimal("100").compareTo(useCase.getTotalDue("p1")));
        assertEquals(List.of(b.getId()), useCase.getPaidInvoices().stream().map(Invoice::getId).toList());
        assertEquals(1, useCase.getRecentPayments().size());
        assertEquals(InvoiceStatus.PENDING, useCase.getInvoice(a.getId()).getStatus());
    }

    @Test
    void monthlyRevenueCountsOnlyPaidInThatMonth() {
        var paidNow = create("p1", "100");
        useCase.payInvoice(paidNow.getId());
        var refunded = create("p1", "30");
        useCase.payInvoice(refunded.getId());
        useCase.refund(refunded.getId());
        create("p1", "999"); // pending: not revenue

        var old = create("p1", "60");
        useCase.payInvoice(old.getId());
        repo.findById(old.getId()).get().setPaidAt(LocalDateTime.now().minusMonths(2));

        assertEquals(0, new BigDecimal("100").compareTo(useCase.calculateMonthlyRevenue()));
        assertEquals(0, new BigDecimal("60")
                .compareTo(useCase.calculateMonthlyRevenue(YearMonth.now().minusMonths(2))));
    }

    @Test
    void bulkCancelPendingLeavesPaidAlone() {
        var pending = create("p1", "10");
        var paid = create("p1", "20");
        useCase.payInvoice(paid.getId());
        useCase.bulkCancelPending("p1");
        assertEquals(InvoiceStatus.CANCELLED, useCase.getInvoice(pending.getId()).getStatus());
        assertEquals(InvoiceStatus.PAID, useCase.getInvoice(paid.getId()).getStatus());
    }

    private static class InMemoryRepository implements InvoiceRepository {
        private final Map<String, Invoice> store = new LinkedHashMap<>();

        @Override public Invoice save(Invoice invoice) { store.put(invoice.getId(), invoice); return invoice; }
        @Override public Optional<Invoice> findById(String id) { return Optional.ofNullable(store.get(id)); }
        @Override public List<Invoice> findAll() { return List.copyOf(store.values()); }
        @Override public void deleteById(String id) { store.remove(id); }
    }
}
