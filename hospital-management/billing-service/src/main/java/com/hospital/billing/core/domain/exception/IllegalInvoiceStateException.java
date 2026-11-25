package com.hospital.billing.core.domain.exception;

import com.hospital.billing.core.domain.entity.InvoiceStatus;

/** Thrown when an operation is not allowed for the invoice's current status. */
public class IllegalInvoiceStateException extends RuntimeException {
    public IllegalInvoiceStateException(String id, InvoiceStatus current, String operation) {
        super("Cannot " + operation + " invoice " + id + " in status " + current);
    }
}
