package com.hospital.billing.core.domain.exception;

/** Thrown when no invoice exists for the requested id. */
public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(String id) {
        super("Invoice not found: " + id);
    }
}
