package com.hospital.patient.core.domain.exception;

/** Thrown when a patient with the given email already exists. */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("A patient with email " + email + " already exists");
    }
}
