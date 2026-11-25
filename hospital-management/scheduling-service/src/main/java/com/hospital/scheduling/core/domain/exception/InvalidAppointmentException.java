package com.hospital.scheduling.core.domain.exception;

/** Thrown when an appointment request is malformed or a status transition is not allowed. */
public class InvalidAppointmentException extends RuntimeException {
    public InvalidAppointmentException(String message) {
        super(message);
    }
}
