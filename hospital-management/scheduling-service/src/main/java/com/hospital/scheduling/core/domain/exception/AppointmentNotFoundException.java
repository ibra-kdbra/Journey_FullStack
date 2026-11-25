package com.hospital.scheduling.core.domain.exception;

/** Thrown when no appointment exists for the requested id. */
public class AppointmentNotFoundException extends RuntimeException {
    public AppointmentNotFoundException(String id) {
        super("Appointment not found: " + id);
    }
}
