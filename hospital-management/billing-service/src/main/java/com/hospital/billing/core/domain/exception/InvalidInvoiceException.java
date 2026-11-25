package com.hospital.billing.core.domain.exception;

/** Thrown when an invoice request carries invalid ids, amounts or discounts. */
public class InvalidInvoiceException extends RuntimeException {
    public InvalidInvoiceException(String message) {
        super(message);
    }
}
