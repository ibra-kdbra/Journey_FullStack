package com.hospital.patient.core.domain.exception;

/** Thrown when no patient exists for the requested id. */
public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(String id) {
        super("Patient not found: " + id);
    }
}
