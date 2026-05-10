package com.hospital.billing.core.domain.repository;

import com.hospital.billing.core.domain.entity.Invoice;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository {
    Invoice save(Invoice invoice);
    Optional<Invoice> findById(String id);
    List<Invoice> findAll();
    void deleteById(String id);
}
